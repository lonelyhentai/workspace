use std::collections::HashMap;

pub struct MorseDecoder {
    morse_code: HashMap<String, String>,
}

impl MorseDecoder {
    pub fn new() -> Self {
        MorseDecoder {
            morse_code: [("-...-", "="), ("...", "S"), ("--..", "Z"), (".-", "A"), ("-....-", "-"), (".-..-.", "\""), ("...--", "3"), (".----.", "\'"), ("-.--", "Y"), ("-----", "0"), (".-.-.", "+"), ("--.", "G"), ("-", "T"), (".-.-.-", "."), (".----", "1"), ("-..", "D"), ("-.-.--", "!"), ("--", "M"), ("--...", "7"), (".", "E"), ("-.-", "K"), ("---..", "8"), ("-.-.-.", ";"), ("-....", "6"), (".--.", "P"), ("..--..", "?"), ("----.", "9"), ("-.--.", "("), ("-.", "N"), (".---", "J"), ("-..-.", "/"), ("---...", ","), ("..---", "2"), ("..-", "U"), ("...-..-", "$"), ("..-.", "F"), ("...---...", "SOS"), ("-.-.", "C"), ("..", "I"), ("-..-", "X"), (".--.-.", "@"), ("..--.-", "_"), (".-.", "R"), (".....", "5"), ("....", "H"), ("--.-", "Q"), (".-..", "L"), ("...-", "V"), ("-...", "B"), ("....-", "4"), ("-.--.-", ")"), ("--..--", ","), (".-...", "&"), ("---", "O"), (".--", "W")]
                .iter().map(|&(k,v)|(k.to_string(),v.to_string())).collect()
        }
    }

    pub fn decode_morse(&self, encoded: &str) -> String {
        encoded.trim().split("   ")
            .map(|word| word.split(" ")
                .map(|character| self.morse_code.get(character)
                    .map(|x| x.clone()).unwrap_or_else(|| "".to_string()))
                .collect::<Vec<String>>().join("")
            )
            .collect::<Vec<String>>().join(" ")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hey_jude() {
        let decoder = MorseDecoder::new();
        assert_eq!(
            decoder.decode_morse(".... . -.--   .--- ..- -.. ."),
            "HEY JUDE"
        );
    }
}
