#[macro_use] extern crate lazy_static;
#[macro_use] extern crate serde_derive;
extern crate serde;
extern crate regex;

#[macro_use]
extern crate llvm_sys_wrapper;


#[macro_use]
mod parser_core;

pub mod ast;
pub mod emitter;
pub mod tokenizer;
pub mod parser;
pub mod codegen;

pub use tokenizer::*;
pub use parser::*;