var app = angular.module('myApp', []);

app.controller('mainCtrl', function ($scope, getData, betslip) {

    // Get "lige.json"
    getData.getJSON('data/lige.json').then(function (data) {
        $scope.leagues = data;
        // console.log('Leagues: ', $scope.leagues);
    });

    // Get "offers.json"
    getData.getJSON('data/ponude.json').then(function (data) {
        $scope.offers = data;
        // console.log('Offers: ', $scope.offers);
    });

    // Get outcome if name matches
    $scope.getOutcome = function (name, typesOffer, offer) {
        if (typesOffer.indexOf(offer.id) === -1) return false;

        var outcomes = offer.tecajevi,
            len = outcomes.length,
            i;
        for (i = 0; i < len; i++) {
            if (outcomes[i].naziv === name) {
                return outcomes[i].tecaj;
            }
        }
    };

    // Add item to betslip
    $scope.addToBetslip = function (item, bet) {
        if (bet.outcome === '-') return;

        if (betslip.exist(item.id) > -1) {
            if (betslip.isSameOutcome(item.id, bet.type.naziv)) {
                betslip.remove(item.id);
                return;
            }

            betslip.remove(item.id);
        }

        betslip.add({
            id: item.id,
            number: item.broj,
            name: item.naziv,
            time: item.vrijeme,
            outcome: bet.type.naziv,
            value: bet.outcome
        });
    };

    $scope.betslip = betslip;
});

// Betslip controler
app.controller('betslipCtrl', function ($scope, betslip) {
    $scope.items = betslip;
});

// Service to get data
app.service('getData', function ($http) {
    this.getJSON = function (path) {
        return $http.get(path).then(function (response) {
            if (response.data) {
                return response.data;
            }
        });
    };
});

// Betslip service
app.service('betslip', function () {
    var items = {};

    items.list = [];
    items.payout = 0;

    items.add = function (match) {
        items.list.push({
            id: match.id,
            number: match.number,
            name: match.name,
            time: match.time,
            outcome: match.outcome,
            value: match.value
        });
        
        // Update payout
        items.updatePayout();
    };

    items.remove = function (id) {
        var index = items.exist(id);

        if (index > -1) {
            items.list.splice(index, 1);
        }
        
        // Update payout
        items.updatePayout();
    };

    // Check if item exist in list 
    items.exist = function (id) {
        var list = items.list,
            len = list.length,
            i;

        for (i = 0; i < len; i++) {
            if (list[i].id === id) return i;
        }

        return -1;
    };

    items.isSameOutcome = function (id, outcome) {
        var list = items.list,
            len = list.length,
            i;

        for (i = 0; i < len; i++) {
            if (list[i].id === id && list[i].outcome === outcome) return true;
        }

        return false;
    };
    
    items.updatePayout = function() {
        var list = items.list,
            len = list.length,
            payout = 1,
            i;
        
        for(i = 0; i < len; i++) {
            payout *= list[i].value;
        }
        
        items.payout = payout.toFixed(2);
    };

    return items;
});