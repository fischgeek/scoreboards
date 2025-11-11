$(function() {
    var game = loadGame()
    setupConfetti()
    if (game.isSaved) { startGame() }

    $('#btn-start-game').attr('disabled', 'disabled')

    $('#btn-add-new-player').click(function() { addPlayer() })

    $('#btn-start-game').click(function() { startGame() })

    $("#btn-end-round").click(function() { endRound() })

    $('#btn-save-updated-scores').click(function() { saveUpdatedScores() })

    $('#btn-new-game').click(function() { newGame() })

    $('#btn-end-game-confetti').click(function() { 
        saveUpdatedScores()
        gameOver() 
    })

    $('#btn-reset').click(function() { reset() })

    $('#edit-icon').click(function() { editScores() })

    $("#modal-update-scores").on('hidden.bs.modal', function() { game.editMode = false })

    function startGame() {
        if (game.players.length > 0) {
            $("#setup-row").hide()
            $("#btn-start-game").hide()
            $("#btn-new-game").hide()
            $("#btn-reset").hide()
            $("#btn-end-round").show()
            $("#edit-icon").show()
            $('#btn-end-game-confetti').hide()
            $('#btn-save-updated-scores').show()
            game.isSaved = false
            updateGameBoard()
        }
    }

    function endRound() {
        game.editMode = false
        $("#modal-update-scores-body").empty()
        $("#modal-title").text("Round " + game.round + " Ended")
        $("#modal-instructions").text("Enter the scores for round " + game.round + ".")
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            var html = '<div style="padding-bottom:5px" class="col-4"><label>' + p.name + '</label><input id="' + p.name + '-score" type="number" class="form-control" value=""></input></div>'
            $("#modal-update-scores-body").append(html)
        }
        $("#modal-update-scores").modal("show")
        if (game.round == 7) {
            $("#btn-save-updated-scores").hide()
            $("#btn-end-game-confetti").show()
        }
    }

    function editScores() {
        game.editMode = true
        $("#modal-update-scores-body").empty()
        $("#modal-title").text("Edit Player Scores")
        $("#modal-instructions").text("Alter the players' total scores as needed.")
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            var html = '<div style="padding-bottom:5px" class="col-4"><label>' + p.name + '</label><input id="' + p.name + '-score" type="number" class="form-control" value="' + p.score + '"></input></div>'
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
            if (game.editMode) {
                p.score = x
            } else {
                p.score += x
            }
        }
        if (!game.editMode) {
            game.round += 1
            game.isSaved = true
        }
        $("#modal-update-scores").modal("hide")
        updateGameBoard()
    }

    function updateGameBoard() {
        $("#game-round").text("Round " + game.round)
        if (game.round > 1 && game.isSaved) {
            updateDealer()
        }
        populatePlayersList()
        saveGame()
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

    function updateLeader() {
        for (var j = 0; j < game.players.length; j++) {
            game.players[j].isLeader = ""
        }
        const tempList = game.players.slice()
        tempList.sort((a, b) => a.score - b.score)
        const lowestScore = tempList[0].score
        const playersWithLowestScore = game.players.filter(player => player.score === lowestScore)
        if (playersWithLowestScore.length === 1) {
            playersWithLowestScore[0].isLeader = "leader"
        }
        // for (var i = 0; i < playersWithLowestScore.length; i++) {
        //     playersWithLowestScore[i].isLeader = ""
        // }
        // const lowestScorePlayer = game.players.reduce((lowest, player) => {
        //     return (player.score < lowest.score)? player : lowest
        //   }, game.players[0])
        // lowestScorePlayer.isLeader = "leader"
        // for (var i = 0; i < game.players.length; i++) {
        //     var p = game.players[i]
        //     if (p.score < checkScore) {
        //         checkScore = p.score
        //         game.players[i].isLeader = "leader"
        //     }
        // }
    }

    function addPlayer() {
        var playerName = $("#new-player-name").val().replace(" ", "")
        if (playerName) {
            var newPlayer = {
                name: playerName,
                score: 0,
                dealer: game.players.length == 0 ? true : false
            }
            $('#btn-start-game').removeAttr('disabled')
            game.players.push(newPlayer)
            populatePlayersList()
            $("#new-player-name").val("")
            $("#new-player-name").focus()
        }
    }

    function populatePlayersList() {
        $("#players-list").empty()
        updateLeader()
        for (var i = 0; i < game.players.length; i++) {
            var p = game.players[i]
            if (p.dealer) {
                $("#players-list").append('<li class="player-list-item list-group-item d-flex justify-content-between align-items-center list-group-item-primary ' + p.isLeader + '">' + p.name + '<span class="playerscore" player="' + p.name + '">' + p.score + '</span></li>')
            } else {
                $("#players-list").append('<li class="player-list-item list-group-item d-flex justify-content-between align-items-center ' + p.isLeader + '">' + p.name + '<span class="playerscore" player="' + p.name + '">' + p.score + '</span></li>')
            }
        }
    }

    function gameOver() {
        $("#modal-update-scores").modal("hide")
        $("#btn-end-round").hide()
        $("#btn-new-game").show()
        $("#btn-reset").show()
        var sorted = game.players.slice().sort((a, b) => {
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

    function saveGame() {
        game.isSaved = true
        localStorage.setItem('rummy', JSON.stringify(game))
        console.log(game)
    }

    function setupConfetti() {
        // Pass in the id of an element
        let confetti = new Confetti('btn-end-game-confetti');

        // Edit given parameters
        confetti.setCount(100);
        confetti.setSize(1);
        confetti.setPower(25);
        confetti.setFade(false);
        confetti.destroyTarget(false);
    }
})