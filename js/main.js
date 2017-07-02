/* JavaScript Cashe Memory Simulator - 2017, Luan Félix, Mateus Lins Aceto, Marlon Galvão */


//chamada das funções quando o documento terminar de ser inicializado

$(document).ready(function() {
	app.materialize();	
	setTimeout(function(){
		app.masonry();
	}, 300);
	
	
	//Memoria Principal
	app.main_memory();
	app.cache_memory();
	
});

// Funções

var app = 
    (function(self, $) {
		//Inicialização dos componetes do materialize	
		self.materialize = function(){
			$(".button-collapse").sideNav();
			$('.modal').modal();
		}
		//inicializando a LIB masonry...
		
		self.masonry = function(){
			var $grid = $('.grid').masonry({
			  itemSelector: '.grid-item'
			});
			$grid.masonry();	
		}
		
		//Inicialização da memoria Cache e memoria principal
		// num.toString(2)
		self.main_memory_init = function(){
			var memoriaPrincipal = [];
			var enderecoI = 0;
			var blocoI = 0;
			for(i = 0; i<256; i++){
				memoriaPrincipal[i] = {word: [0, 0, 0, 0], bloco: blocoI, endereco: enderecoI.toString(2)};
				enderecoI++;
				if(i%2 != 0)
					blocoI++;
			}
			return memoriaPrincipal;
		}
		
		
		self.cache_memory_init = function(memoriaCache){
			var memoriaCache = [];
			for(var i = 0; i<16; i++){
				memoriaCache[i] = {rotulo: 0000, quadro: 00, celula0: 'X' , celula1: 'X', celula2: 'X', celula3: 'X', sujo: 0, valido: 0, LRU: 0};
			}
			return memoriaCache;
		}
				
		self.main_memory = function(){
			var memoriaPrincipal = [];
			if(memoriaPrincipal[0] == undefined)	
				memoriaPrincipal = self.main_memory_init();
			for(var i = 0; i<256; i++){
				$('#mainMemory').append(
					'<tr>' +
						'<td>'+memoriaPrincipal[i].endereco+'</td>' +
						'<td>'+memoriaPrincipal[i].bloco+'</td>' +
						'<td>'+memoriaPrincipal[i].word+'</td>' +
					'</tr>'
				);
			}
		
		}

		self.cache_memory = function(){
			var memoriaCache = [];
			
			var check1, check2;
			
			if(memoriaCache[0] == undefined)	
				memoriaCache = self.cache_memory_init();
			
			for(var i = 0; i<16; i++){
				if(memoriaCache[i].sujo == 0){
					check1 = '<p><input type="checkbox" id="test6" checked="checked" /><label for="test6"></label></p>';
				}
				else {
					check1 = '<p><input type="checkbox" id="test6"  checked="unchecked"/><label for="test6"></label></p>';
				}
				if(memoriaCache[i].valido == 0){
					check2 = '<p><input type="checkbox" id="test6" checked="checked" /><label for="test6"></label></p>';
				}
				else {
					check2 = '<p><input type="checkbox" id="test6"  checked="unchecked"/><label for="test6"></label></p>';
				}
				$('#cacheMemory').append(
					'<tr>' +
						'<td>'+memoriaCache[i].rotulo+'</td>' +
						'<td>'+memoriaCache[i].quadro+'</td>' +
						'<td>'+memoriaCache[i].celula0+'</td>' +
						'<td>'+memoriaCache[i].celula1+'</td>' +
						'<td>'+memoriaCache[i].celula2+'</td>' +
						'<td>'+memoriaCache[i].celula3+'</td>' +
						'<td>'+check1+'</td>' +
						'<td>'+check2+'</td>' +
						'<td>'+memoriaCache[i].LRU+'</td>' +
					'</tr>'
				);
			}
			
		}
		/*
		self.writeValue = function(){
			var valeuToMemory;
			$('#submitBtn').click(function(){
				valeuToMemory = $('#writeImput').val();
				valeuToMemory = valeuToMemory.split("");
				$('#tableCashe').find('tr').each(function(){
					if($(this).find('.rotulo').)
				})
			});
		}	
		*/


		
			
		return self;
	} (app||{}, jQuery));
