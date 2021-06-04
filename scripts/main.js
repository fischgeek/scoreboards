$(document).ready(function () {
    var game = {
        round: 1,
        players: Array()
    }

    $('#btn-add-new-player').click(function () { addPlayer() })

    $('#btn-start-game').click(function () { startGame() })

    $("#btn-end-round").click(function () { endRound() })

    $('#btn-save-updated-scores').click(function () { saveUpdatedScores() })

    function startGame() {
        $("#setup-row").hide()
        $("#btn-start-game").hide()
        $("#btn-end-round").show()
        $("#game-round").text("Round " + game.round)
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
        $("#modal-update-scores").modal("hide")
        updateGameBoard()
    }

    function updateGameBoard() {
        game.round++
        $("#game-round").text("Round " + game.round)
        updateDealer()
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

    function addPlayer(name) {
        var newPlayer = {
            name: $("#new-player-name").val().replace(" ", ""),
            score: 0,
            dealer: game.players.length == 0 ? true : false
        }
        game.players.push(newPlayer)
        populatePlayersList()
        $("#new-player-name").val("")
        $("#new-player-name").focus()
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
        var sorted = game.players.sort((a, b) => {
            return (a.score < b.score) ? -1 : 1
        })
        var winner = sorted[0]
        $("#game-round").text(winner.name + " wins!")
    }
})