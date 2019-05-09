extern crate yalc;

use std::fs::{File, read_dir};
use std::io::Read;

use yalc::{tokenize, parse_from_tokens};

#[test]
fn should_not_parse() {
    for entry in read_dir("parse_examples/should_not_parse").unwrap() {
        let entry = entry.unwrap();

        let contents = {
            let mut file = File::open(entry.path())
                .expect("Unable to open file!");

            let mut contents = String::new();
            file.read_to_string(&mut contents)
                .expect("Unable to read from file!");

            contents
        };

        println!("\nTokenizing file {}", entry.path().display());

        let tokens = match tokenize(&contents) {
            Ok(tokens) => tokens,
            Err(_) => continue,
        };

        println!("Parsing file {}", entry.path().display());

        let ast = match parse_from_tokens(&tokens) {
            Ok(ast) => ast,
            Err(_) => continue,
        };

        panic!("File should not parse:\n{}\n\nTokens: {:?}\n\nAST: {:?}", entry.path().display(), tokens, ast);
    }
}