module Main exposing (..)

import Browser
import Html exposing (Html, div, text)
import Http
import Json.Decode as Json exposing (Decoder, field, string)
import Random exposing (Generator, int)

type alias Model =
    { word : String
    , definition : String
    }

type Msg
    = FetchDefinition (Result Http.Error String)

init : Model
init =
    { word = ""
    , definition = ""
    }

update : Msg -> Model -> Model
update msg model =
    case msg of
        FetchDefinition (Ok definition) ->
            { model | definition = definition }

        FetchDefinition (Err _) ->
            model

getAt : Int -> List a -> Maybe a
getAt index list =
    List.drop index list |> List.head

view : Model -> Html Msg
view model =
    div []
        [ div [] [ text ("Word: " ++ model.word) ]
        , div [] [ text ("Definition: " ++ model.definition) ]
        ]

fetchDefinition : String -> Cmd Msg
fetchDefinition word =
    Http.get
        { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
        , expect = Http.expectString FetchDefinition
        }

randomWord : List String -> Generator (Maybe String)
randomWord words =
    let
        indexRange =
            List.length words |> (\length -> if length > 0 then length - 1 else 0)
    in
    Random.int 0 indexRange |> Random.map (\index -> getAt index words)

main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
        , update = update
        , view = view
        }

