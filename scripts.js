(function () {

    $(function () {
        $("document").ready(function () {
            $(".coins-container").empty();
            onHomePage();
        })

        $("#home").on("click", function () {
            $(".coins-container").empty();
            clearInterval(chartInterval);
            onHomePage();
        })

        function onHomePage() {
            $(".coins-container").append(`<img src="image/coin.jpg" class="coinImage">`)
            let url = `https://api.coingecko.com/api/v3/coins`;

            $('#gif').show();

            $.get(url).then(function (coins) {
                showCoinsOnUI(coins);

                for(let coin of selectedCoins){
                    $(`#check${coin}`).prop("checked", true);
                }                

                $('#gif').hide();

                $("#btn").on("click", function () {
                    $(".coins-container").empty();
                    $(".coins-container").append(`<img src="image/coin.jpg" class="coinImage">`)
                    let searchValue = $("#search").val().toLowerCase();
                    let filteredArray = coins.filter(coin => coin.symbol.includes(searchValue));
                    showCoinsOnUI(filteredArray);
                    $("#search").val("");
                });

            })
                .catch(function (error) {
                    console.log(error);
                    alert("Failed to get user data");
                });
        }

        $("#about").on("click", function () {
            $(".coins-container").empty();
            clearInterval(chartInterval);
            onAboutPage();
        })
    });

    function onAboutPage() {
        $(".coins-container").append(`<div id="aboutPage"><div class="social">
        <a href="https://www.facebook.com/maria.vareikis.1"><img class="facebook" src="image/facebook-icon.png" alt=""></a>
        <a href="https://www.instagram.com/masha_vareikis/"><img class="instagram" src="image/icon.png"alt=""></a>
    </div>
    <div class="about-myself">

    <h1>About Myself</h1>

    </div>
    <img src="image/son.jpg" class="son">

    <h2>Maria from Holon 27 years old. Hobbies:</h2>    
   
    <li>Spend time with my child</li>
    <li>Go for a walk with my dog</li>
    <li>Gym</li>
    <li>watching TV shows</li>
    <li>Learning</li>
    <li>Reading</li></div>`)

    }

})();

function showCoinsOnUI(coins) {
    for (let coin of coins) {
        addCoinToUI(coin);
        showMoreInfo(coin.id);
    }
}

function addCoinToUI(coin) {
    let coinCard =
        `<div class="coin-card">
                <label class="switch">
                    <input type="checkbox" id="check${coin.symbol}" onchange="onToggleClick(this, '${coin.symbol}')"></input>
                    <span class="slider round"></span> 
                </label>
                <div class="title">${coin.symbol}</div>
                <br>
                <div class="coin-body">${coin.name}</div>
                <br>
                <div class="coin-container"><img class="coin-image" src=${coin.image.thumb}/></div>
                <br>
             
                <div class="more-info-div">
                    <button data-toggle="collapse" data-target="#${coin.id}" id="moreInfo${coin.id}" class="more-info collapsed"></button>
                </div>

                <div class="collapse show" id="open${coin.id}">
                    <div class="card collapse in" id="${coin.id}"></div>
                </div>
        </div>`;

    $(".coins-container").append(coinCard);
}

let coins = new Map();

function showMoreInfo(coinId) {
    $(`#moreInfo${coinId}`).on('click', function () {
        if (coins.has(coinId)) {
            let cachedCoin = coins.get(coinId);
            getMoreInfoData(coinId, cachedCoin);
        }
        else {
            $(`#${coinId}.card`).append(
                `<div class="load-gif"><img id="gifMoreInfo" src="image/loader.gif" width="30" height="30"></div>`)
        }
        $.get(`https://api.coingecko.com/api/v3/coins/${coinId}`).then(coin => {
            let newCoin = coin.market_data.current_price;
            getMoreInfoData(coinId, newCoin);
            coins.set(coin.id, { ils: coin.market_data.current_price.ils, usd: coin.market_data.current_price.usd, eur: coin.market_data.current_price.eur });
            setTimeout(() => coins.delete(coin.id), 120000);
        }).catch(function (error) {
            console.log(error);
            alert("Failed to get user data");
        });
    })
}

function getMoreInfoData(coinId, cachedCoin) {
    $(`#${coinId}.card`).html(`
    <div class="moreInfoContainer">
    <span>ILS: ₪${cachedCoin.ils}</span>
    <br>
    <span>USD: $${cachedCoin.usd}</span>
    <br>
    <span>EUR: €${cachedCoin.eur}</span>
    </div>
    `)
}

let selectedCoins = [];
let selectedToggleIds = [];
let togglesCounter = 0;
function onToggleClick(currentToggle, coinSymbol) {
    console.log("onToggleClick");
    let toggleId = currentToggle.id;
    let symbolCoinIndex = selectedCoins.indexOf(coinSymbol);
    let indexToggleId = selectedToggleIds.indexOf(toggleId);
    if (symbolCoinIndex != -1) {
        selectedCoins.splice(symbolCoinIndex, 1);
        selectedToggleIds.splice(indexToggleId, 1);
    }
    else {
        if (selectedCoins.length < 5) {
            togglesCounter++;
            selectedCoins.push(coinSymbol);
            selectedToggleIds.push(toggleId);
        }
        else {
            $(`#modalBody`).empty();
            $(`#${toggleId}`).prop("checked", false);
            $(`#modalBody`).html('To add the "<b id="b">' + coinSymbol.toUpperCase() + '</b>" coin, you must unselect one of the following: <br>');
            $('#myModal').css("display", "block");
            $('#keepCurrent').on("click", () => {
                $('#myModal').css("display", "none");
            });
            let counterId = 1;
            for (let i = 0; i < selectedCoins.length; i++) {
                $(`#modalBody`).append(
                    `<div id="modalDiv">
                        <div class="card" id="modalCard">
                            <div class="card-body" id="modalCardBody"> 
                                <h6 id="modalCoinName" class="card-title">${selectedCoins[i].toUpperCase()}</h6>
                                <label class="switch" id="modalSwitch">
                                    <input type="checkbox" class="checkbox" id="chosenToggle${counterId}"><span class="slider round" id="modalSlider"></span>
                                </label>
                    
                            </div>
                        </div>
                    </div>`
                )
                $(`#chosenToggle${counterId}`).prop("checked", true);
                $(`#chosenToggle${counterId}`).on("change", () => {
                    let indexCoinRemove = selectedCoins.indexOf(selectedCoins[i]);
                    let toggleToFalse = selectedToggleIds[indexCoinRemove];
                    selectedCoins.splice(indexCoinRemove, 1);
                    selectedToggleIds.splice(indexCoinRemove, 1);
                    selectedCoins.push(coinSymbol);
                    selectedToggleIds.push(toggleId);
                    $(`#myModal`).css("display", "none");
                    $(`#${toggleToFalse}`).prop("checked", false);
                    doubleCheckToggle();
                })
                counterId++;
            }
        }
    }
}

function doubleCheckToggle() {
    for (let i = 0; i < selectedToggleIds.length; i++) {
        $(`#${selectedToggleIds[i]}`).prop('checked', true);
    }
}

let chartInterval;
$(`#live-reports`).on('click', function () {
    $(".coins-container").empty();
    let firstCoinSelected = [];
    let secondCoinSelected = [];
    let thirdCoinSelected = [];
    let fourthCoinSelected = [];
    let fifthCoinSelected = [];
    let coinKeysArray = [];
    chartInterval = setInterval(() => {
        getDataFromAPI();
    }, 2000);
    function getDataFromAPI() {
        let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoins[0]},${selectedCoins[1]},${selectedCoins[2]},${selectedCoins[3]},${selectedCoins[4]}&tsyms=USD`;
        $.get(url).then(result => {
            $(`.coins-container`).html(`<div id="chart-container" style="height: 400px; width: 100%; margin-top: 20px"></div>`);
            let currentTime = new Date();
            let coinCounter = 1;
            for (let key in result) {
                if (coinCounter == 1) {
                    firstCoinSelected.push({ x: currentTime, y: result[key].USD });
                    coinKeysArray.push(key);
                }

                if (coinCounter == 2) {
                    secondCoinSelected.push({ x: currentTime, y: result[key].USD });
                    coinKeysArray.push(key);
                }

                if (coinCounter == 3) {
                    thirdCoinSelected.push({ x: currentTime, y: result[key].USD });
                    coinKeysArray.push(key);
                }

                if (coinCounter == 4) {
                    fourthCoinSelected.push({ x: currentTime, y: result[key].USD });
                    coinKeysArray.push(key);
                }

                if (coinCounter == 5) {
                    fifthCoinSelected.push({ x: currentTime, y: result[key].USD });
                    coinKeysArray.push(key);
                }
                coinCounter++;
            }
            createChart();
        })
    }

    function createChart() {
        let options = {
            animationEnabled: false,
            backgroundColor: "white",
            title: {
                text: "Currencies"
            },
            axisX: {
                ValueFormatString: "HH: mm: ss",
                titleFontColor: "red",
                lineColor: "red",
                labelFontColor: "red",
                tickColor: "red"
            },
            axisY: {
                suffix: "$",
                titleFontColor: "blue",
                lineColor: "blue",
                labelFontColor: "blue",
                tickColor: "blue"
            },
            tooltip: {
                shared: true
            },
            data: [{
                type: "spline",
                name: coinKeysArray[0],
                showInLegend: true,
                xValueFormatString: "HH: mm: ss",
                dataPoints: firstCoinSelected
            },
            {
                type: "spline",
                name: coinKeysArray[1],
                showInLegend: true,
                xValueFormatString: "HH: mm: ss",
                dataPoints: secondCoinSelected
            },
            {
                type: "spline",
                name: coinKeysArray[2],
                showInLegend: true,
                xValueFormatString: "HH: mm: ss",
                dataPoints: thirdCoinSelected
            },
            {
                type: "spline",
                name: coinKeysArray[3],
                showInLegend: true,
                xValueFormatString: "HH: mm: ss",
                dataPoints: fourthCoinSelected
            },
            {
                type: "spline",
                name: coinKeysArray[4],
                showInLegend: true,
                xValueFormatString: "HH: mm: ss",
                dataPoints: fifthCoinSelected
            }]
        }
        $(`#chart-container`).CanvasJSChart(options);
        $(`.coins-container`).append(options);
    }

})

