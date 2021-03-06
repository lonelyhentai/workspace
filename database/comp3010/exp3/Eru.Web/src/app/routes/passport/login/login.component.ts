import { SettingsService, _HttpClient } from '@delon/theme';
import { Component, OnDestroy, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import {
  SocialService,
  ITokenService,
  DA_SERVICE_TOKEN,
} from '@delon/auth';
import { ReuseTabService } from '@delon/abc';
import { StartupService } from '@core';
import { ApiService } from '@core/eru/api.service';
import { ACLService } from '@delon/acl';
import { UserDto } from '@core/eru/dtos/user.dto';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
})
export class UserLoginComponent implements OnDestroy {
  form: FormGroup;
  error = '';
  type = 0;


  constructor(
    fb: FormBuilder,
    modalSrv: NzModalService,
    private router: Router,
    private settingsService: SettingsService,
    private socialService: SocialService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    public http: _HttpClient,
    public msg: NzMessageService,
    private apiService: ApiService,
    private aclService: ACLService
  ) {
    this.form = fb.group({
      userName: [null, [Validators.required, Validators.minLength(4)]],
      password: [null, Validators.required],
    });
    modalSrv.closeAll();
  }

  // #region fields

  get userName() {
    return this.form.controls.userName;
  }

  get password() {
    return this.form.controls.password;
  }

  switch(ret: any) {
    this.type = ret.index;
  }

  submit() {
    this.error = '';
    this.userName.markAsDirty();
    this.userName.updateValueAndValidity();
    this.password.markAsDirty();
    this.password.updateValueAndValidity();
    if (this.userName.invalid || this.password.invalid) return;

    this.http
      .post(this.apiService.apiJoin('sessions'), {
        Name: this.userName.value,
        Password: this.password.value,
      })
      .subscribe((res: any) => {
        const user = res.body.User as UserDto;
        const token = res.body.Token as {  token: string,
          expires_in: number,
          token_type: string};
        // ????????????????????????
        this.reuseTabService.clear();
        this.apiService.apiCache.user = user;
        // ????????????Token??????
        this.tokenService.set(token);
        // ????????????????????????????????????
        this.settingsService.setUser({name:user.Name,avatar:user.Avatar,id: user.Id });
        // ACL????????????????????????
        this.aclService.setFull(true);
        // ???????????? StartupService ???????????????????????????????????????????????????????????????????????????????????????
        this.msg.success('????????????????????????');
        this.startupSrv.load().then(() => {
          let url = this.tokenService.referrer.url || '/dashboard';
          if (url.includes('/passport')) url = '/dashboard';
          this.router.navigateByUrl(url);
        });
      });
  }

  ngOnDestroy(): void {
  }
}
