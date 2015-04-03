'use strict';

angular.module('avalonApp')
  .controller('VoteOnQuestersCtrl', function ($scope, $rootScope, $location, $modal, game, player, socket) {
    $scope.game = game;
    function init(){
      $scope.voted = _.reduce(game.state.playerOrder, function (memo, playerId) {
        memo[playerId] = false;
        return memo;
      }, {});
      $scope.votes = _.reduce(game.state.playerOrder, function (memo, playerId) {
        memo[playerId] = 0;
        return memo;
      }, {});
    }
    init();
    socket.on('votedOnQuesters', function (msg) {
      $scope.voted[msg.playerId] = true;
    });
    socket.on('questRejected', function (msg) {
      console.log(msg);
      $scope.votes = msg.votes;
      game.state.currentQuest().numRejections++;
      game.state.kingIndex++;
      game.state.stage = game.STAGES.SELECT_QUESTERS;
      $rootScope.$broadcast('stateChanged', game.state.stage);
    });
    socket.on('questAccepted', function (msg) {
      console.log(msg);
      $scope.votes = msg.votes;
      //TODO: need to display vote values and who voted accept or reject
      game.state.stage = game.STAGES.QUEST;
      $rootScope.$broadcast('stateChanged', game.state.stage);
    });

    function openVoteModal() {
      $modal.open({
        templateUrl: 'app/voteOnQuesters/voteOnQuesters.modal.html',
        controller: 'VoteOnQuestersModalCtrl',
        size: 'sm',
        backdrop: 'static',
        resolve: {}
      });
    }

    $rootScope.$on('stateChanged', function (scope, msg) {
      if (msg === game.STAGES.VOTE_ON_QUESTERS) {
        init();
        openVoteModal();
      }
    });
  });
