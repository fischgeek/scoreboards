$(function() {
    var game = loadGame()
    if (game.isSaved) { startGame() }

    $('#btn-add-new-player').click(function() { addPlayer() })

    $('#btn-start-game').click(function() { startGame() })

    $("#btn-end-round").click(function() { endRound() })

    $('#btn-save-updated-scores').click(function() { saveUpdatedScores() })

    $('#btn-new-game').click(function() { newGame() })

    $('#btn-reset').click(function() { reset() })

    function startGame() {
        $("#setup-row").hide()
        $("#btn-start-game").hide()
        $("#btn-new-game").hide()
        $("#btn-reset").hide()
        $("#btn-end-round").show()
        updateGameBoard()
    }

    function endRound() {

        $("#modal-update-scores-body").empty()
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            var html = '<div style="padding-bottom:5px" class="col-4"><label>' + p.name + '</label><input id="' + p.name + '-score" type="number" class="form-control"></input></div>'
            $("#modal-update-scores-body").append(html)
        }
        $("#modal-update-scores").modal("show")
    }

    function saveUpdatedScores() {
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            var x = $("#" + p.name + "-score").val()
            x = parseInt(x)
            if (isNaN(x)) {
                x = 0
            }
            p.score += x
        }
        game.round += 1
        game.isSaved = true
        localStorage.setItem('rummy', JSON.stringify(game))
        $("#modal-update-scores").modal("hide")
        updateGameBoard()
    }

    function updateGameBoard() {
        $("#game-round").text("Round " + game.round)
        if (game.round > 1) {
            updateDealer()
        }
        populatePlayersList()
        if (game.round == 8) {
            gameOver()
        }
    }

    function updateDealer() {
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            if (p.dealer) {
                p.dealer = false

                if (i + 1 == game.players.length) {
                    game.players[0].dealer = true
                } else {
                    game.players[i + 1].dealer = true
                }
                break
            }
        }
    }

    function addPlayer() {
        var playerName = $("#new-player-name").val().replace(" ", "")
        if (playerName) {
            var newPlayer = {
                name: playerName,
                score: 0,
                dealer: game.players.length == 0 ? true : false
            }
            game.players.push(newPlayer)
            populatePlayersList()
            $("#new-player-name").val("")
            $("#new-player-name").focus()
        }
    }

    function populatePlayersList() {
        $("#players-list").empty()
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            if (p.dealer) {
                $("#players-list").append('<li class="list-group-item d-flex justify-content-between align-items-center list-group-item-primary">' + p.name + '<span class="playerscore">' + p.score + '</span></li>')
            } else {
                $("#players-list").append('<li class="list-group-item d-flex justify-content-between align-items-center">' + p.name + '<span class="playerscore">' + p.score + '</span></li>')
            }
        }
    }

    function gameOver() {
        $("#btn-end-round").hide()
        $("#btn-new-game").show()
        $("#btn-reset").show()
        var sorted = game.players.sort((a, b) => {
            return (a.score < b.score) ? -1 : 1
        })
        var winner = sorted[0]
        $("#game-round").text(winner.name + " wins!")
        localStorage.clear()
    }

    function newGame() {
        game.round = 1
        for (var i = 0; i < game.players.length; i++) {
            game.players[i].score = 0
        }
        console.log(game)
        startGame()
    }

    function reset() {
        localStorage.clear()
        location.reload()
    }

    function loadGame() {
        var existingGame = localStorage.getItem('rummy')
        if (existingGame) {
            game = JSON.parse(existingGame, game)
        } else {
            var game = {
                round: 1,
                isSaved: false,
                players: Array()
            }
        }
        return game
    }
})