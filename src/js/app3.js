App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
   if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    
    // Modern DApp Browsers
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
    try { 
      window.ethereum.enable().then(function() {
          // User has allowed account access to DApp...
      });
      } catch(e) {
      // User has denied account access to DApp...
      }
    }
  // Legacy DApp Browsers
    else if (window.web3) {
      web3 = new Web3(web3.currentProvider);
    }
    // Non-DApp Browsers
      else {
      alert('You have to install MetaMask !');
      }
      // END OF MODERN 

    return App.initContract();

  },


  initContract: function() {
    $.getJSON("Software.json", function(software) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Software = TruffleContract(software);
      // Connect provider to interact with contract
      App.contracts.Software.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Software.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.useEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new use is recorded
        App.render();
      });
    });
  },

  render: function() {
    var useInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
        $("#UserID").html("Your User ID: " + UserID);
      }
    });

    // Load contract data
    App.contracts.Software.deployed().then(function(instance) {
      useInstance = instance;
      return useInstance.licenceCount();
    }).then(function(licenceCount) {
      var useResults = $("#useResults");
      useResults.empty();

      var licencesSelect = $('#licencesSelect');
      licencesSelect.empty();

      for (var i = 1; i <= licenceCount; i++) {
        useInstance.licences(i).then(function(licence) {
          var id = licence[0];
          var UserID = licence[1];
          var name = licence[2];
          var useCount = licence[3];

          // Render licence use Result
          var licenceTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + useCount + "</td></tr>"
          useResults.append(licenceTemplate);

          // Render licence choice option
          var licenceOption = "<option value='" + id + "' >" + name + "</ option>"
          licencesSelect.append(licenceOption);
        });
      }
      return useInstance.users(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castUse: function() {
    var licenceId = $('#licencesSelect').val();
    App.contracts.Software.deployed().then(function(instance) {
      return instance.use(licenceId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});