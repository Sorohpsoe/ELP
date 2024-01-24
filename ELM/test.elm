defDecoder : JP.Decoder Definition
defDecoder =
    JP.succeed Definition
        |> JP.required "definition" JP.string
        |> JP.required "synonyms" (JP.list JP.string)
        |> JP.required "antonyms" (JP.list JP.string)

meaningDecoder : JP.Decoder Meaning
meaningDecoder =
    JP.succeed Meaning
        |> JP.required "partOfSpeech" JP.string
        |> JP.required "definitions" (JP.list defDecoder)

phoneticsDecoder : JP.Decoder Phonetics
phoneticsDecoder =
    JP.succeed Phonetics
        |> JP.required "audio" JP.string

wordDecoder : JP.Decoder Word
wordDecoder =
    JP.succeed Word
        |> JP.required "word" JP.string
        |> JP.required "phonetics" (JP.list phoneticsDecoder)
        |> JP.required "meanings" (JP.list meaningDecoder)
