const allCurrenciesData = 'https://api.changenow.io/v1/currencies?active=true&fixedRate=true';
const APIKey = 'c9155859d90d239f909d2906233816b26cd8cf5ede44702d422667672b58b0cd';

async function app() {

await fetch(allCurrenciesData)
  .then(response => response.json())
  .then(items => {

  	Vue.component('active-currency', {
  		data() {
  			return {
  				items
  			}
  		},
  		props: ['index'],
		  template: `
			  <div class="w-4/12 currencies relative flex justify-around items-center cursor-pointer">
			  	<span>
				  	<img :src="items[index].image" :alt="items[index].name">
				  </span>
				  <span class="uppercase">
				  	{{items[index].ticker}}
				  </span>
				  <span class="icons-color">
				  	<i class="fas fa-angle-down"></i>
				  </span>
			  </div>`
		});

const vueApp = new Vue ({
  		el: '#app',
  		data: {
  			fromCurrency: 0,
  			toCurrency: 1,
  			items,
  			inputVal: 0,
  			pairIsInactive: false,
  			isMinAmount: 0,
  			estimateAmont: 0,
  			activeSide: '',
  			searchVal: ''
  		},
  		computed: {
  			pairOfTickers() {
  				const activeTicker = (i) => this.items[i].ticker;
					return `${activeTicker(this.fromCurrency)}_${activeTicker(this.toCurrency)}`;
  			},
  			estimatedAmountFunc() {
  				if (this.inputVal >= this.isMinAmount) {
  					fetch(`https://api.changenow.io/v1/exchange-amount/${this.inputVal}/${this.pairOfTickers}?api_key=${APIKey}`)
							.then(response => response.json())
							.then(estAmObj => {
								this.estimateAmont = estAmObj.estimatedAmount;
					  })
  				}
  			},
  			searchInput() {
  				let searchValue = this.searchVal.toLowerCase();

	  			const filteredCharacters = this.items.filter((character) => {
			        return (
			            character.name.toLowerCase().includes(searchValue) ||
			            character.ticker.toLowerCase().includes(searchValue)
			        );
			    });
			    return filteredCharacters
  			}
  		},
  		methods: {
  			swap() {
  				let fromVal = this.fromCurrency;
  				this.fromCurrency = this.toCurrency;
  				this.toCurrency = fromVal;

  				this.exchangeRates();
  			},
  			exchangeRates() {

					fetch(`https://api.changenow.io/v1/min-amount/${this.pairOfTickers}?api_key=${APIKey}`)
				 		.then(response => {
				 			if (response.status === 400) {
				 				console.log('pair_is_inactive')
				 			}
				 			return response.json()
				 		})
			  	  .then(currencyMinAmount => {
			  	  	if (!currencyMinAmount.hasOwnProperty('minAmount')) {
			  	  		this.inputVal = 0;
			  	  		this.pairIsInactive = true;
			  	  		
			  	  	}else {
			  	  		this.isMinAmount = currencyMinAmount.minAmount;
			  	  		this.inputVal = currencyMinAmount.minAmount;
			  	  		this.pairIsInactive = false;
			  	  	};

			  	  	this.estimatedAmountFunc;
			  	})
					
  			},
  			hideAllSearchs() {
  				document.querySelectorAll('.fields').forEach(i => {
  					i.classList.add('hideList')
  				})
  				this.searchVal = ''
  			},
  			openList(e) {
  				this.hideAllSearchs()
  				let parentElem = e.currentTarget.parentElement;
  				parentElem.classList.remove('hideList')
  				parentElem.querySelector('input[type="search"]').focus()
  				this.activeSide = e.currentTarget.getAttribute('dir')
  			},
  			closeList(e) {
  				e.currentTarget.parentElement.classList.add('hideList')
  			},
  		},
  		mounted(){
			  this.exchangeRates();
			},
			updated() {
				setTimeout(() => this.estimatedAmountFunc, 300);
			},
			components:{
        'searchfromlist': {
        	props: ['value'],
        	template: `
					  <input type="search"
					  			 :value="value"
					  			 @input="$emit('input', $event.target.value)"
					  			 class="absolute currencyList inset-0 w-full bg-gray-50 outline-none py-1.5 px-2"
					  >`
        },
        'closelist': {
        	template: `
					  <div class="absolute currencyList z-10 top-0 bottom-0 right-0 bg-gray-50 flex justify-center items-center"
					  		 style="width: 22px">
					  	<i class="fas fa-times cursor-pointer"></i>
					  </div>
					`
        },
        'currencies-list': {
		  		props: ['arr'],
        	methods: {
		  			changeCurrency(e) {
		  				let indexKey = e.currentTarget.getAttribute('index-key');
		  				let dr = e.currentTarget.parentElement.parentElement;
		  				switch(vueApp.activeSide){
		  					case "from":
							    vueApp.fromCurrency = indexKey
							    break;
							  case "to":
							    vueApp.toCurrency = indexKey
							    break;
		  				}
		  				vueApp.exchangeRates()
		  				dr.classList.add('hideList')
		  			},
		  		},
				  template: `
					  <div class="absolute currencyList z-10 left-0 top-full right-0 rounded-sm bg-gray-50 overflow-auto max-h-40"
					  		 id="cryptoList">
					  	<div class="cursor-pointer flex justify-start items-center p-2 hover:bg-gray-200"
					  			 v-for="(item, index) in arr"
					  			 :index-key="index"
					  			 @click="changeCurrency">
					  		<div>
				  				<img :src="item.image" :alt="item.name">
				  			</div>
				  			<div class="uppercase pl-2">{{item.ticker}}</div>
				  			<div class="text-gray-400 pl-2" id="currencyName">{{item.name}}</div>
					  	</div>
					  </div>
					`
        }
    	}
  	})

  });
}
app();