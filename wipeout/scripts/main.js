$(document).ready(function () {
    var game = loadGame()
    if (game.isSaved) { startGame() }

    $("#btn-add-new-player").click(function () { addPlayer() })
    $("#btn-start-game").click(function () { startGame() })
    $("#btn-end-round").click(function () { endRound() })
    $("#btn-save-updated-scores").click(function () { saveUpdatedScores() })
    $("body").on("click", "#btn-end-player-turn", function () { endPlayerTurn() })
    $("#btn-start-over").click(function () { startOver() })
    $("#btn-clear-scores").click(function () { clearScores() })
    $("#btn-cancel").click(function () { $("#modal-confirm").modal("hide") })
    $("#btn-confirm").click(function () { confirmAction() })

    function startGame() {
        if (game.players.length > 0) {
            $("#setup-row").hide()
            $("#btn-start-game").hide()
            $("#btn-end-round").show()
            $("#leader").show()
            $("#game-round").text("Wipe Out")
            $(".in-game-button").show()
            game.isSaved = false
            game.loadedFromSave = true // spoof
            updateGameBoard()
        }
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

    function updateGameBoard() {
        if (!game.loadedFromSave) {
            nextPlayerTurn()
        }
        populatePlayersList()
        saveGame()
    }

    function nextPlayerTurn() {
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            if (p.isTurn) {
                p.isTurn = false

                if (i + 1 == game.players.length) {
                    game.players[0].isTurn = true
                } else {
                    game.players[i + 1].isTurn = true
                }
                break
            }
        }
    }

    function addPlayer() {
        var newPlayerName = $("#new-player-name").val().replace(/\s/g, '')
        if (newPlayerName === "") {
            $("#new-player-name").focus()
            return
        }
        if (playerExists(newPlayerName)) {
            $("#new-player-name").focus()
            return
        }
        var newPlayer = {
            name: newPlayerName,
            score: 0,
            isTurn: game.players.length == 0 ? true : false
        }
        game.players.push(newPlayer)
        populatePlayersList()
        $("#new-player-name").val("")
        $("#new-player-name").focus()
    }

    function playerExists(playerName) {
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            if (p.name == playerName) {
                return true
            }
        }
        return false
    }

    function endPlayerTurn() {
        var ap = $('.active-player').find('.player-name').text()
        var x = $('.active-player').find('.player-new-score').val()
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            if (ap == p.name) {
                x = parseInt(x)
                if (isNaN(x)) {
                    x = 0
                }
                p.score += x
                console.log(`${p.name} - ${p.score}`)
            }
        }
        updateGameBoard()
    }

    function populatePlayersList() {
        $("#players-list").empty()
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            console.log(p.name)
            if (p.isTurn) {
                $("#players-list").append(`
                <li id="${p.name}" class="active-player list-group-item d-flex justify-content-between align-items-center list-group-item-primary">
                    <span class="player-name">${p.name}</span>
                    <span><input class="player-new-score" type="number" /></span>
                    <span>
                        <button id="btn-end-player-turn" type="button" class="btn btn-primary">
                        <i class="glyph material-icons">check</i>
                        </button>
                    </span>
                    <span class="playerscore">${addCommas(p.score.toString())}</span>
                </li>`)
            } else {
                $("#players-list").append(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="player-name">${p.name}</span>
                <span class="playerscore">${addCommas(p.score.toString())}</span>
                </li>`)
            }
        }
        updateLeader()
        $(".player-new-score").focus()
    }

    function getSortedPlayers() {
        var clone = [...game.players]
        var sorted = clone.sort((a, b) => {
            return (a.score < b.score) ? 1 : -1
        })
        return sorted
    }

    function updateLeader() {
        var sorted = getSortedPlayers()
        var leader = sorted[0]
        if (leader.score > 0) {
            $("#leader").show()
            $("#leader").text(`${leader.name} ${addCommas(leader.score.toString())}`)
        } else {
            $("#leader").hide()
        }
    }

    function gameOver() {
        var sorted = getSortedPlayers()
        var winner = sorted[0]
        $("#game-round").text(winner.name + " wins!")
    }

    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    function startOver() {
        game.modalIsForStartOver = true
        $("#action-to-confirm").text("start over")
        $("#modal-confirm").modal("show")
    }

    function clearScores() {
        game.modalIsForStartOver = false
        $("#action-to-confirm").text("clear scores")
        $("#modal-confirm").modal("show")
    }

    function confirmAction() {
        if (game.modalIsForStartOver) {
            localStorage.clear()
            location.reload()
        } else {
            for (var i = 0; i < game.players.length; i++) {
                var p = game.players[i]
                p.score = 0
                p.isTurn = false
            }
            game.players[0].isTurn = true
            populatePlayersList()
            updateGameBoard()
            $("#modal-confirm").modal("hide")
        }
    }

    function loadGame() {
        var existingGame = localStorage.getItem('wipeout')
        if (existingGame) {
            game = JSON.parse(existingGame, game)
            game.loadedFromSave = true
        } else {
            var game = {
                round: 1,
                isSaved: false,
                players: Array(),
                laodedFromSave: false
            }
        }
        return game
    }

    function saveGame() {
        game.isSaved = true
        game.loadedFromSave = false
        localStorage.setItem('wipeout', JSON.stringify(game))
        console.log(game)
    }
})