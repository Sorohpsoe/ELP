module Main exposing(..)
import Html exposing (..)
import Html.Attributes exposing(..)
import Html.Events exposing (onInput, onClick)
import String
import Browser
import Random
import Json.Decode exposing (map2, Decoder, field, string)
import Http 


-- Main 
main : Program () Model Msg
main = 
  Browser.element
    { init = init
    , update = update 
    , subscriptions = \_ -> Sub.none
    , view = view 
    }

-- Model

type alias Model =
  { state : State
  , wordList : List String
  , listDef : (List Word)
  , guess : String}

type State
  = Failure
  | Loading
  | Success 

type alias Word = 
  { word : String
  , meanings : (List Meaning)}


type alias Meaning =
  { partOfSpeech : String
  , definitions : (List Definition)}

type alias Definition = 
  { def : String}

init : () -> (Model, Cmd Msg)
init _ =
  ({state = Loading ,wordList=[],listDef = [], guess =""} , getListWord)

-- Update

type Msg 
  = MorePlease
  | GotWord (Result Http.Error String)
  | GotIndex Int
  | GotDef (Result Http.Error (List Word))
  | NewGuess String
  | GiveAnswer

update : Msg -> Model -> (Model, Cmd Msg)
update msg model = 
  case msg of 
    MorePlease ->
      ({ model |state =Loading ,wordList =[], listDef = [], guess = "" }, getListWord)
    GotWord result ->
      case result of
        Ok words ->
          ( { model |state =Success, wordList = String.words words, listDef = [], guess = "" }, Random.generate GotIndex (Random.int 1 1000) )
        Err _ ->
          ({ model |state =Failure ,wordList = [],listDef = [], guess = "" }, Cmd.none)
    GotIndex index ->
      case (getWordFromIndex model.wordList index ) of 
        "Error" -> ({ model |state =Failure ,wordList = [],listDef = [], guess = "" }, Cmd.none)
        word -> ( { model |state =Success, wordList = model.wordList, listDef = [], guess = "" }, getRandomDef word )
    GotDef result ->
      case result of 
        Ok def ->
          ({ model |state =Success ,wordList = model.wordList,listDef = def, guess = "" }, Cmd.none)
        Err _ ->
          ({ model |state =Failure ,wordList = model.wordList,listDef = [], guess = "" }, Cmd.none)
    NewGuess try ->
      ({model | state=model.state,wordList = model.wordList,listDef=model.listDef, guess =try}, Cmd.none)
    GiveAnswer ->
      ({model | state = model.state,wordList = model.wordList,listDef=model.listDef,guess = leMot (model.listDef)},Cmd.none)


-- View 

view : Model -> Html Msg
view model = 
  div[] 
  [ h1 [] [text (if String.toLower (model.guess) ==String.toLower(leMot( model.listDef)) then leMot(model.listDef) else "Guess the word !")]
  , viewWord model
  ]

viewWord : Model -> Html Msg
viewWord model = 
  case model.state of 
    Failure ->
      div[]
        [ text "I could not load a word"
        , button [onClick MorePlease][text "Reload"]]
    Loading ->
      text "Loading ..."
    Success ->
      ul[]
        [ wordsList model.listDef  
        ,h3[][text "Type here : ", input [value model.guess, onInput NewGuess][],div[][text (if String.toLower(model.guess) == String.toLower(leMot (model.listDef)) then "Bien joué" else (if model.guess == "" then "" else "Mauvaise réponse"))]
         ], button [ onClick MorePlease, style "display" "block" ][text "Play Again !"], button [onClick GiveAnswer, style "display" "block"][text "Show Answer"]]

  
getRandomDef : String -> Cmd Msg
getRandomDef word = 
  Http.get 
    { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
    , expect = Http.expectJson GotDef listMotsDecoder}

getListWord : Cmd Msg 
getListWord = 
  Http.get
    { url = "http://localhost:8000/words.txt"
    , expect = Http.expectString GotWord}

getWordFromIndex : List String -> Int -> String
getWordFromIndex list index = 
  case list of 
    [] -> "Error"
    h::t -> 
      case index of 
        0 -> h
        _ -> getWordFromIndex t (index-1)

-- Fonctions 
defList : (List Definition) -> Int -> Html Msg
defList definitions i = 
  case definitions of 
    [] -> div[][]
    (h::t) -> div [] [ul [] [ul[][text (String.fromInt(i)++ ". " ++ h.def)]], defList t (i+1)]
    
definitionList : (List Meaning)-> Html Msg 
definitionList meanings = 
  case meanings of  
    [] -> div[][]
    (h::t) -> div[] [h3  [][ul [][text (h.partOfSpeech ++ " :")]], defList h.definitions 0,definitionList t ]

wordsList : (List Word) -> Html Msg
wordsList words =
  case words of
    [] -> div[][]
    (h::t) -> div[][h2[][text "Meaning :" ],  definitionList h.meanings , wordsList t]

leMot : (List Word) -> String
leMot words = 
  case words of 
    [] -> "Probleme"
    h::_ -> h.word 



--Decoder 

wordsDecoder : Decoder Word
wordsDecoder =
  map2 Word
    (field "word" string)
    (field "meanings" listDefinitionDecoder)

listDefinitionDecoder :  Decoder (List Meaning )
listDefinitionDecoder = Json.Decode.list definitionDecoder 

definitionDecoder : Decoder Meaning
definitionDecoder =
  map2 Meaning
    (field "partOfSpeech" string)
    (field "definitions" listDefDecoder)

listDefDecoder : Decoder (List Definition)
listDefDecoder = Json.Decode.list defDecoder 

defDecoder : Decoder Definition
defDecoder = 
  Json.Decode.map Definition
    (field "definition" string)      

listMotsDecoder : Decoder (List Word)
listMotsDecoder = Json.Decode.list wordsDecoder


