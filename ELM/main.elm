module Main exposing (..)

import Browser
import Html exposing (Html, div, input, button, text)
import Html.Attributes exposing (placeholder, type_)
import Http exposing (..)
import Json.Decode exposing (Decoder, list)
import Random exposing (Generator, int, initialSeed, generate)
import List.Extra exposing (getAt)
-- MODEL

type alias Model =
    { words : List String
    , word : String
    , definitions : List String
    , userInput : String
    , isCorrect : Bool
    }

init : Model
init =
    { words = []
    , word = ""
    , definitions = []
    , userInput = ""
    , isCorrect = False
    }

-- MSG

type Msg
    = LoadWords
    | LoadWordsSuccess (List String)
    | LoadWordsFailure Http.Error
    | LoadRandomWord
    | LoadRandomWordSuccess String
    | LoadRandomWordFailure Http.Error
    | FetchDefinitions String
    | FetchDefinitionsSuccess (List String)
    | FetchDefinitionsFailure Http.Error
    | UserInput String
    | CheckAnswer

-- UPDATE

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        LoadWords ->
            (model, loadWords)

        LoadWordsSuccess words ->
            ({ model | words = words }, getRandomWord words)

        LoadWordsFailure _ ->
            (model, Cmd.none)

        LoadRandomWord ->
            getRandomWord model.words

        LoadRandomWordSuccess newWord ->
            ({ model | word = newWord }, fetchDefinitions newWord)

        LoadRandomWordFailure _ ->
            (model, Cmd.none)

        FetchDefinitions word ->
            (model, fetchDefinitions word)

        FetchDefinitionsSuccess defs ->
            ({ model | definitions = defs }, Cmd.none)

        FetchDefinitionsFailure _ ->
            (model, Cmd.none)

        UserInput input ->
            ({ model | userInput = input }, Cmd.none)

        CheckAnswer ->
            let
                isCorrect =
                    model.userInput == model.word
            in
            ({ model | isCorrect = isCorrect }, Cmd.none)



-- Function to get a random word from the list of words
getRandomWord : List String -> Model -> (Model, Cmd Msg)
getRandomWord words model =
    case List.isEmpty words of
        True ->
            (model, Cmd.none)

        False ->
            let
                index =
                    Random.int 0 (List.length words - 1)
                        |> Random.generate
                        |> Random.initialSeed
                        |> Random.step
                        |> Tuple.first

                newWord =
                    getAt index words
                        |> Maybe.withDefault ""
            in
            ({ model | word = newWord }, fetchDefinitions newWord)

loadWords : Cmd Msg
loadWords =
    Http.send LoadWords (Http.get "words.txt")


fetchDefinitions : String -> Cmd Msg
fetchDefinitions word =
    Http.send (FetchDefinitions word) <| Http.get ("https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word)

-- VIEW

view : Model -> Html Msg
view model =
    div []
        [ div []
            [ button [ onClick LoadWords ] [ text "Load Words" ]
            , button [ onClick LoadRandomWord ] [ text "Load Random Word" ]
            , input [ type_ "text", placeholder "Enter your guess", onInput UserInput, value model.userInput ]
            , button [ onClick CheckAnswer ] [ text "Check Answer" ]
            ]
        , viewResult model
        ]

viewResult : Model -> Html Msg
viewResult model =
    div []
        [ if model.word /= "" then
            div []
                [ div [] [ text "Word: ", text model.word ]
                , div [] [ text "Definitions: ", text <| String.join ", " model.definitions ]
                , div [ style "color" (if model.isCorrect then "green" else "red") ] [ text (if model.isCorrect then "Correct!" else "Incorrect!") ]
                ]
          else
            text "Press 'Load Words' to start."
        ]

-- PROGRAM

main =
    Browser.element
        { init = \_ -> (init, loadWords)
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
