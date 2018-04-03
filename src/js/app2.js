App = {
    web3Provider: null,
    contracts: {},

    init: function() {
      /*
       * Is there an injected web3 instance ?
       */
      if (typeof web3 !== 'undefined') {
          App.web3Provider = web3.currentProvider;
      } else {
          // If no injected web3 instance is detected, fall back to Ganache
          App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      }
      web3 = new Web3(App.web3Provider);

      return App.initContract();
    },

    initContract: function() {
      /*
       * load Adoption.json, save Adoption's ABI
       */
      $.getJSON('Adoption.json', function(data) {
          // use Adoption.json create a TruffleContract
          var AdoptionArtifact = data;
          App.contracts.Adoption = TruffleContract(AdoptionArtifact);
          // set the provider for our contract
          App.contracts.Adoption.setProvider(App.web3Provider);
          // use our contract to retrieve and mark the adopted pets
          return App.markAdopted();
      });

      return App.bindEvents();
    },

    bindEvents: function() {
      $(document).on('click', '.btn-adopt', App.handleAdopt);
    },

    markAdopted: function(adopters, account) {
      /*
       *
       */
      var adoptionInstance;
      App.contracts.Adoption.deployed().then(function(instance) {
          adoptionInstance = instance;
          return adoptionInstance.getAdopters.call();
      }).then(function(adopters) {
          for (i = 0; i < adopters.length; i++) {
              if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
                  $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
              }
          }
      }).catch(function(err) {
          console.log(err.message);
      });
    },

    handleAdopt: function(event) {
      event.preventDefault();

      var petId = parseInt($(event.target).data('id'));
      var adoptionInstance;
      web3.eth.getAccounts(function(error, accounts) {
          if (error) {
              console.log(error);
          }

          var account = accounts[0];

          App.contracts.Adoption.deployed().then(function(instance) {
              adoptionInstance = instance;
              return adoptionInstance.adopt(petId, {from: account});
          }).then(function(result) {
              return App.markAdopted();
          }).catch(function(err) {
              console.log(err.message);
          });
      });
    }

  };

  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
