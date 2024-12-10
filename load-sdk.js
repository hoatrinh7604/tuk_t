const plugin = new UnityTonPlugin.default({
  manifestUrl:
    "https://catb.io/tonconnect-manifest.json",
    onWalletConnected: () => {
		if(unityInstanceRef != null)
		{
			unityInstanceRef.SendMessage("GameElement", "OnWalletConnectSuccess", plugin.getAccount()); 
		}
    }
});

const bscPlugin = new CatBattleEvmSdk.default({
  shopAddress: "0xe7680BE3C42bec37671AD25933d7847De2a842B8", // should support same address all chains (create2)
});

const solPlugin = new SolUnitySDK.default({
  privateKey:
    "5qF9hWtDYGeRhiuY1ujCzejDuoj4PvSyVJHe9sdzyRXawiqjnnPMWaaofarf6z3zNxLGSJcCEZE7jQCipMFKfXCP",
  purchaseItemAddress: "GD37r8DmKERcDDC9wXbKJeCGhR24ZWD3KgdyBwHev1rq",
});
