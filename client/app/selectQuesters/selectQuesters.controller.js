'use strict';


angular.module('avalonApp')
  .controller('SelectQuestersCtrl', function ($rootScope, $scope, socket, $location, game, player) {
    $scope.game = game;
    $scope.player = player;

    $scope.questers = _.reduce(game.state.playerOrder, function (memo, playerId) {
      memo[playerId] = false;
      return memo;
    }, {});

    socket.on('questersSubmitted', function(msg) {
      game.state.currentQuest().selectedQuesters = msg.selectedQuesters;
      game.state.stage = game.STAGES.VOTE_ON_QUESTERS;
      $rootScope.$broadcast('voteOnQuesters');
    });

    function selectQuester(selectedQuesterId) {
      socket.emit('selectQuester', {
        gameId: game.state.id,
        playerId: selectedQuesterId
      });
      socket.once('selectQuesterNack', function () {
        $scope.questers[selectedQuesterId] = false;
      });
      socket.once('selectQuesterAck', function () {
        socket.removeAllListeners('selectQuesterNack');
      })
    }

    function removeQuester(selectedQuesterId) {
      socket.emit('removeQuester', {
        gameId: game.state.id,
        playerId: selectedQuesterId
      });
      socket.once('removeQuesterNack', function () {
        $scope.questers[selectedQuesterId] = true;
      });
      socket.once('removeQuesterAck', function () {
        socket.removeAllListeners('removeQuesterNack');
      })
    }

    $scope.fireSelectOrRemoveQuester = function (playerId) {
      if ($scope.questers[playerId]) {
        selectQuester(playerId);
      } else {
        removeQuester(playerId);
      }
    };


    if (player.state.id !== game.state.playerOrder[game.state.kingIndex]) {
      socket.on('questerSelected', function (msg) {
        $scope.questers[msg.selectedQuesterId] = true;
      });
      socket.on('questerRemoved', function (msg) {
        $scope.questers[msg.removedQuesterId] = false;
      });
    }

    $scope.submitQuesters = function() {
      socket.emit('submitQuesters', {
        gameId: game.state.id
      });
    }

  });
