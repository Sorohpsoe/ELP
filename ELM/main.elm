module Main exposing (..)

import Browser
import Browser.Navigation as Navigation
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Random
import Json.Decode exposing (..)
import Json.Decode.Pipeline as JP


type alias Model =
    { word : String
    , definitions : List Definition
    , guess : String
    }

type alias Definition =
    { partsOfSpeech : String
    , definitions : List Definition
    }

type Msg
    = FetchWords (Result Http.Error String)
    | FetchDefinition (Result Http.Error (List Word))
    | WordGenerated (Maybe String)
    | GuessSubmitted (String)
    | Reload



init : () -> (Model, Cmd Msg)
init _ =
    ( { word = "", definitions = [], wordResponses = [] }, Http.get { url = "words.txt", expect = Http.expectString FetchWords } )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        FetchWords (Ok words) ->
            let
                wordList = String.split " " words
                cmd = Random.generate WordGenerated (randomWord wordList)
            in
            ( model, cmd )

        FetchWords (Err _) ->
            ( model, Cmd.none )

        FetchDefinition 

        WordGenerated maybeWord ->
            case maybeWord of
                Just word ->
                    ( { model | word = word }, fetchDefinitionCmd word )

                Nothing ->
                    ( model, Cmd.none )

getDefinition : String -> Cmd Msg
getDefinition answer = Http.get
    { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ answer
    , expect = Http.expectJson FetchDefinition (Json.Decode.list wordDecoder)
    }

getAt : Int -> List a -> Maybe a
getAt index list =
    List.drop index list |> List.head

view : Model -> Html Msg
view model =
    div []
        [ h1 [] [ text model.word ]
        , ul [] (List.concatMap viewWordResponse model.wordResponses)
        ]

viewWordResponse : WordResponse -> List (Html Msg)
viewWordResponse wordResponse =
    [ h1 [] [ text wordResponse.word ]
    , ul [] (List.concatMap viewMeaning wordResponse.meanings)
    ]

viewMeaning : Meaning -> List (Html Msg)
viewMeaning meaning =
    [ li [] [ text meaning.partOfSpeech ]
    , ul [] (List.concatMap viewDefinition meaning.definitions)
    ]

viewDefinition : Definition -> List (Html Msg)
viewDefinition definition =
    [ li [] [ text definition.definition ] ]


fetchDefinitionCmd : String -> Cmd Msg
fetchDefinitionCmd word =
    Http.get
        { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
        , expect = Http.expectJson FetchDefinition wordDecoder
        }

definitionDecoder : Decoder Definition
definitionDecoder =
    Json.map3 Definition
        (Json.field "definition" Json.string)
        (Json.field "synonyms" (Json.list Json.string))
        (Json.field "antonyms" (Json.list Json.string))

meaningDecoder : Decoder Meaning
meaningDecoder =
    Json.map2 Meaning
        (Json.field "partOfSpeech" Json.string)
        (Json.field "definitions" (Json.list definitionDecoder))

wordDecoder : Decoder WordResponse
wordDecoder =
    Json.map2 WordResponse
        (Json.field "word" Json.string)
        (Json.field "meanings" (Json.list meaningDecoder))
        
randomWord : List String -> Generator (Maybe String)
randomWord words =
    let
        indexRange =
            List.length words |> (\length -> if length > 0 then length - 1 else 0)
    in
    Random.int 0 indexRange |> Random.map (\index -> getAt index words)

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
