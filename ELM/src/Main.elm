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
--Creation of models

type alias Model =
  { state : State
  , wordList : List String
  , listDef : (List Word)
  , guess : String}

--The three different states the Model can be
type State
  = Failure
  | Loading
  | Success 

--Contain the word and its definition
type alias Word = 
  { word : String
  , meanings : (List Meaning)}

--Contain the type of the word in partofSpeech and the different definitions
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
  = AnotherWord
  | GotWord (Result Http.Error String)
  | GotIndex Int
  | GotDef (Result Http.Error (List Word))
  | NewGuess String
  | GiveAnswer

update : Msg -> Model -> (Model, Cmd Msg)
update msg model = 
  case msg of

    -- The user clicked on the button to get another word, put the state to Loading and get the list of words.
    AnotherWord ->
      ({ model |state =Loading ,wordList =[], listDef = [], guess = "" }, getListWord)
    
    -- The list of words is got, put the state to Success and get a random index.
    GotWord result ->
      case result of
        Ok words ->
          ( { model |state =Success, wordList = String.words words, listDef = [], guess = "" }, Random.generate GotIndex (Random.int 1 1000) )
        Err _ ->
          ({ model |state =Failure ,wordList = [],listDef = [], guess = "" }, Cmd.none)

    -- The random index generated, get the word from the list of words and get its definition.
    GotIndex index ->
      case (getWordFromIndex model.wordList index ) of 
        "Error" -> ({ model |state =Failure ,wordList = [],listDef = [], guess = "" }, Cmd.none)
        word -> ( { model |state =Success, wordList = model.wordList, listDef = [], guess = "" }, getRandomDef word )

    -- The definition of the word is got, put the state to Success and display the word and its definition.
    GotDef result ->
      case result of 
        Ok def ->
          ({ model |state =Success ,wordList = model.wordList,listDef = def, guess = "" }, Cmd.none)
        Err _ ->
          ({ model |state =Failure ,wordList = model.wordList,listDef = [], guess = "" }, Cmd.none)
    
    -- The user typed a new guess, update the model with the new guess.
    NewGuess try ->
      ({model | state=model.state,wordList = model.wordList,listDef=model.listDef, guess =try}, Cmd.none)

    -- The user clicked on the button to show the answer, update the model with the answer.
    GiveAnswer ->
      ({model | state = model.state,wordList = model.wordList,listDef=model.listDef,guess = chosenWord (model.listDef)},Cmd.none)


-- View 

view : Model -> Html Msg
-- Show the header text, change backgound to lightgreen if the player got the word right.
view model =
  div [style "background-color" (if String.toLower (model.guess) == String.toLower (chosenWord (model.listDef)) then "lightgreen" else "white"), style "height" "100vh", style "width" "100vw"]
  [ h1 [] [text (if String.toLower (model.guess) == String.toLower (chosenWord (model.listDef)) then "You found it !" else "Guess the word !")]
  , viewWord model
  ]

viewWord : Model -> Html Msg
viewWord model = 
  -- Differents cases if the .txt file is loaded or not, if it is loading and loaded.
  case model.state of 
    Failure ->
      div[]
        [ text "I could not load a word"
        , button [onClick AnotherWord][text "Reload"]]
    Loading ->
      text "Loading ..."
    Success ->
      -- Add the input section and buttons, all are linked to their functions. Show if the word is guessed right or wrong.
      ul[]
        [h3[][text "Type here : ", input [value model.guess, onInput NewGuess][],div[][text (if String.toLower(model.guess) == String.toLower(chosenWord (model.listDef)) then "Bien joué" else (if model.guess == "" then "" else "Mauvaise réponse"))]
         ], button [ onClick AnotherWord, style "display" "block" ][text "Play Again !"], button [onClick GiveAnswer, style "display" "block"][text "Show Answer"],
          wordsList model.listDef]

--Get the output of the word with the API with all the definitions related to it  
getRandomDef : String -> Cmd Msg
getRandomDef word = 
  Http.get 
    { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
    , expect = Http.expectJson GotDef listMotsDecoder}

--Get the list of words 
getListWord : Cmd Msg 
getListWord = 
  Http.get
    { url = "http://localhost:8000/src/words.txt"
    , expect = Http.expectString GotWord}

--Take a word in a list of words at a specified index
getWordFromIndex : List String -> Int -> String
getWordFromIndex list index = 
  case list of 
    [] -> "Error"
    h::t -> 
      case index of 
        0 -> h
        _ -> getWordFromIndex t (index-1)

-- Functions which returns Html Msg

-- Display the definitions of the word
defList : (List Definition) -> Int -> Html Msg
defList definitions i = 
  case definitions of 
    [] -> div[][]
    (h::t) -> div [] [ul [] [ul[][text (String.fromInt(i)++ ". " ++ h.def)]], defList t (i+1)]
    
-- Display the different meanings of the word (defList)
definitionList : (List Meaning)-> Html Msg 
definitionList meanings = 
  case meanings of  
    [] -> div[][]
    (h::t) -> div[] [h3  [][ul [][text (h.partOfSpeech ++ " :")]], defList h.definitions 0,definitionList t ]

-- Display the word and its definition (definitionList)
wordsList : (List Word) -> Html Msg
wordsList words =
  case words of
    [] -> div[][]
    (h::t) -> div[][h2[][text "Meaning :" ],  definitionList h.meanings , wordsList t]

--Put the chosen word in a string format
chosenWord : (List Word) -> String
chosenWord words = 
  case words of 
    [] -> "Probleme"
    h::_ -> h.word 



-- Decoder 
-- Turn the json given by the API into types created above.

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


