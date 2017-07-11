/* JavaScript Cashe Memory Simulator - 2017, Luan Félix, Mateus Lins Aceto, Marlon Galvão */


//chamada das funções quando o documento terminar de ser inicializado

var memoriaCache = [], memoriaPrincipal = [];
var status1 = {
	Acessos: 0,
	Acertos: 0,
	Faltas: 0,
	Leituras: 0,
	Escritas: 0,
	Acertos_Leitura: 0,
	Acertos_Escrita: 0,
	Faltas_Leitura: 0,
	Faltas_Escrita: 0
};


$(document).ready(function() {
	app.materialize();	
	setTimeout(function(){
		app.masonry();
	}, 300);
	
	//Memoria Principal
	app.main_memory();
	//Memoria Cache
	app.cache_memory();
	app.processorEvents();
	app.updateStatus();
	
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
		
		self.main_memory_init = function(){
			var memoriaPrincipal = [];
			var enderecoI = 0;
			var blocoI = 0;
			for(i = 0; i<256; i++){
				if(i%4 == 0 && i != 0)
					blocoI++;
				memoriaPrincipal[i] = {word: self.randomValue(), bloco: blocoI, endereco: self.pad(enderecoI.toString(2), 8)};
				enderecoI++;
			}
			return memoriaPrincipal;
		}
		
		
		self.cache_memory_init = function(){		
			var quadroI = 0;
			for(var i = 0; i<16; i++){
				memoriaCache[i] = {rotulo: 'XXX', quadro: self.pad(quadroI.toString(2), 3), celula0: 'X' , celula1: 'X', celula2: 'X', celula3: 'X', sujo: 0, valido: 0, LRU: 0};
				if(i%2 != 0)
					quadroI++;					
			}
			return memoriaCache;
		}
				
		self.main_memory = function(){			
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


			var check1, check2;
			
			if(memoriaCache[0] == undefined)	
				memoriaCache = self.cache_memory_init();
			else
				$('#cacheMemory').html(" ");
			for(var i = 0; i<16; i++){
				if(memoriaCache[i].sujo == 1){
					check1 = '<p><input type="checkbox" id="test6" checked="checked" disabled="disabled"/><label for="test6"></label></p>';
				}
				else {
					check1 = '<p><input type="checkbox" id="test6"  disabled="disabled"/><label for="test6"></label></p>';
				}
				if(memoriaCache[i].valido == 1){
					check2 = '<p><input type="checkbox" id="test6" checked="checked" disabled="disabled"/><label for="test6"></label></p>';
				}
				else {
					check2 = '<p><input type="checkbox" id="test6"  disabled="disabled"/><label for="test6"></label></p>';
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
		
		
		
		self.processorEvents = function(){
			var endereco;
			var dado;
			var bloco;
			var foudCache;
			$('#writeBtn').click(function(){ //escrita
				endereco = $('#enderecoInput').val();
				dado = $('#dadoInput').val();
				endereco = endereco.match(/.{1,3}/g);
				for(var i =0; i<16; i++){
					if(endereco[0] == memoriaCache[i].rotulo){
						if(endereco[1] == memoriaCache[i].quadro){
							foudCache = true;	
							if(endereco[2] == '00'){
								memoriaCache[i].celula0 = dado;	
							}
							else if(endereco[2] == '01'){
								memoriaCache[i].celula1 = dado;
							}
							else if(endereco[2] == '10'){
								memoriaCache[i].celula2 = dado;
							}
							else{
								memoriaCache[i].celula3 = dado;
							}
							memoriaCache[i].sujo = 1;
							memoriaCache[i].valido = 1;
							self.LRU(i);
						    self.writeHit();
							break;
						}
												
					}
					else{
						foudCache = false;
					}
				}
				if(!foudCache){ //caso não achou na cache....
				   bloco = self.findMain(endereco);
				   for(var i =0; i<16; i++){
					   if(endereco[1] == memoriaCache[i].quadro){ //right back
						   if(memoriaCache[i].rotulo != 'XXX' && memoriaCache[i+1].rotulo == 'XXX'){ //LRU
							   i++;
						   }
						   else if(memoriaCache[i].rotulo != 'XXX' && memoriaCache[i+1].rotulo != 'XXX' && memoriaCache[i].LRU < memoriaCache[i+1].LRU){
							   i++;
						   }
						   memoriaCache[i].rotulo = endereco[0];
						   memoriaCache[i].celula0 = bloco[0];
						   memoriaCache[i].celula1 = bloco[1];
						   memoriaCache[i].celula2 = bloco[2];
						   memoriaCache[i].celula3 = bloco[3];
						   if(endereco[2] == '00'){
								memoriaCache[i].celula0 = dado;	
							}
							else if(endereco[2] == '01'){
								memoriaCache[i].celula1 = dado;
							}
							else if(endereco[2] == '10'){
								memoriaCache[i].celula2 = dado;
							}
							else{
								memoriaCache[i].celula3 = dado;
							}
						   memoriaCache[i].sujo = 1;
						   memoriaCache[i].valido = 1;
						   self.writeMiss();
						   self.LRU(i);
						   break;	
					   }
				   }	
				}
				self.cache_memory();
			});
			
		}
		
		
		self.findMain = function(endereco){
			var bloco;
			endereco = endereco[0].concat(endereco[1]);
			for(var i =0; i<256; i++){
				if(endereco == memoriaPrincipal[i].endereco.substring(0, 6)){
				bloco = [memoriaPrincipal[i].word, memoriaPrincipal[i+1].word, memoriaPrincipal[i+2].word, memoriaPrincipal[i+3].word];	
					break;
				}
			}
			return bloco;	
		}
		
		//LRU 
		
		self.LRU = function(k){
			memoriaCache[k].LRU = 0;
			for(var i =0; i<16; i++){
				if(i!=k && memoriaCache[i].rotulo != 'XXX'){
					memoriaCache[i].LRU++;
				}
			}
		}
		
		//Status
		
		self.writeMiss = function(){
			status1.Faltas++;
		    status1.Faltas_Escrita++;
		    status1.Escritas++;
		    status1.Acessos++;
		    self.updateStatus();
			
		}
		
		
		self.readMiss = function(){
			status1.Faltas++;
		    status1.Faltas_Leitura++;
		    status1.Leituras++;
		    status1.Acessos++;
		    self.updateStatus();			
		}
		
		self.writeHit = function(){
			status1.Acertos++;
			status1.Acessos++;
			status1.Acertos_Escrita++;
			status1.Escritas++;
			self.updateStatus();
		}
		
		
		self.readHit = function(){
			status1.Acertos++;
			status1.Acessos++;
			status1.Acertos_Leitura++;
			status1.Leituras++;
			self.updateStatus();			
		}
		
		self.updateStatus = function(){
			$('#statusInfo').html(' ');
			$('#statusInfo').append(
				'<span class="card-title">Estatísticas</span>' +
				'<p>Número de Acessos: '+ status1.Acessos +'</p>' +
				'<p>Número de Acertos: '+ status1.Acertos +'</p>' +
				'<p>Número de Faltas: '+ status1.Faltas +'</p>' +
				'<p>Número de Leituras: '+ status1.Leituras +'</p>' +
				'<p>Número de Escritas: '+ status1.Escritas +'</p>' +
				'<p>Número de Acertos na Leitura: '+ status1.Acertos_Leitura +'</p>' +
				'<p>Número de Acertos na Escrita: '+ status1.Acertos_Escrita+'</p>' +
				'<p>Número de Faltas na Leitura: '+ status1.Faltas_Leitura+'</p>' +
				'<p>Número de Faltas na Escrita: '+ status1.Faltas_Escrita+'</p>'
			);
			
		}
		
		//Funções Auxiliares 
		
		self.byteCount = function(s) { //Retorna o tamanho de 's' em Bytes
			return encodeURI(s).split(/%..|./).length - 1;
		}
		
		
		self.randomValue = function() {
		  var text = "";
		  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		  var byte1 = Math.floor(Math.random() * (5 - 1) + 1); 
 		  for (var i = 0; i < byte1; i++) //max 4 bytes
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		  return text;
		}

		self.pad = function(num, size) {
			var s = "000000000" + num;
			return s.substr(s.length-size);
		}
		
			
		return self;
	} (app||{}, jQuery));
