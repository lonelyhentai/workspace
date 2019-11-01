import {Component, NgZone, OnInit} from '@angular/core';
import {LocalStorageService} from '../../services/local-storage.service';
import {NzMessageService} from 'ng-zorro-antd';
import {ActorNotExistsException, ChainbankAgentService, Privilege} from '../../services/chainbank-agent.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  detailedSetting = false;
  privateKey = '87a6813c3b4cf534b6ae82db9b1409fa7dbd5c13dba5858970b56084c4a930eb400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405';
  api = '';
  contract = '';
  loading = false;
  loadingPrompt = '';

  constructor(
    private readonly localStorage: LocalStorageService,
    private readonly messageService: NzMessageService,
    private readonly chainbank: ChainbankAgentService,
    private readonly zone: NgZone,
    private readonly router: Router,
  ) {
    this.api = this.localStorage.getItemOrDefault('api_address', this.chainbank.defaultApi);
    this.contract = this.localStorage.getItemOrDefault('contract_address', this.chainbank.defaultContract);
  }

  ngOnInit() {
  }

  resetSetting() {
    this.api = this.chainbank.defaultApi;
    this.contract = this.chainbank.defaultContract;
    this.saveSetting();
  }

  saveSetting() {
    this.localStorage.setItem('api_address', this.api);
    this.localStorage.setItem('contract_address', this.contract);
  }

  toggleSetting() {
    this.zone.run(() => {
      this.detailedSetting = !this.detailedSetting;
    });
  }

  beforeImport = (file: File): boolean => {
    const me = this;
    if (file.size > 102400) {
      this.alertInvalidKey();
      return false;
    }
    const reader = new FileReader();
    const loadListener = (e) => {
      const content = e.target.result;
      if (!me.chainbank.validateKeyFormat(content)) {
        me.alertInvalidKey();
      } else {
        me.privateKey = content;
      }
      reader.removeEventListener('loadend', loadListener);
      reader.removeEventListener('error', errorListener);
    };
    reader.addEventListener('loadend', loadListener);
    const errorListener = (e) => {
      me.alertInvalidKey();
      reader.removeEventListener('loadend', loadListener);
      reader.removeEventListener('error', errorListener);
    };
    reader.addEventListener('error', errorListener);
    reader.readAsText(file, 'utf-8');
    return false;
  };

  alertInvalidFormat(typename: string): void {
    this.messageService.warning(`Invalid ${typename} format.`);
  }

  alertInvalidContract(): void {
    this.alertInvalidFormat('contract address');
  }

  alertInvalidKey(): void {
    this.alertInvalidFormat('primary key');
  }

  alertInvalidApi(): void {
    this.alertInvalidFormat('api');
  }

  async login() {
    this.loading = true;
    this.loadingPrompt = 'checking format of settings...';
    if (!this.chainbank.validateKeyFormat(this.privateKey)) {
      this.alertInvalidKey();
    } else if (!this.chainbank.validateContractFormat(this.contract)) {
      this.alertInvalidContract();
    } else if (!this.chainbank.validateApiAddress(this.api)) {
      this.alertInvalidApi();
    } else {
      try {
        for await (const prompt of this.chainbank.login(this.privateKey, this.api, this.contract)) {
          console.log(prompt);
          this.loadingPrompt = prompt;
        }
      } catch (e) {
        if (e instanceof ActorNotExistsException) {
          this.messageService.error(e.message);
        }
        console.log(e);
      }
      this.loadingPrompt = 'successfully logged in, jumping...';
      const consoleUrl = `/${this.chainbank.actor.privilege === Privilege.Customer ? 'customer' : 'clerk'}`;
      this.router.navigateByUrl(consoleUrl);
    }
  }
}
