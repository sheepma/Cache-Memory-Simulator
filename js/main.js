﻿/* JavaScript Cashe Memory Simulator - 2017, Luan Félix, Mateus Lins Aceto, Marlon Galvão */
//chamada das funções quando o documento terminar de ser inicializado
var memoriaCache = [],
    memoriaPrincipal = [];
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
    setTimeout(function() {
        app.masonry();
    }, 300);

    //Memoria Principal
    app.main_memory();
    //Memoria Cache
    app.cache_memory();
    app.processorEvents();
    app.updateStatus();
    app.deleteAll();
    app.configs();

});

// Funções

var app =
    (function(self, $) {
        //Inicialização dos componetes do materialize	
        self.materialize = function() {
            $(".button-collapse").sideNav();
            $('.modal').modal();
        }
        //inicializando a LIB masonry...

        self.masonry = function() {
            var $grid = $('.grid').masonry({
                itemSelector: '.grid-item'
            });
            $grid.masonry();
        }

        //Inicialização da memoria Cache e memoria principal

        self.main_memory_init = function() {
            var enderecoI = 0;
            var blocoI = 0;
            for (i = 0; i < 256; i++) {
                if (i % 4 == 0 && i != 0)
                    blocoI++;
                memoriaPrincipal[i] = {
                    word: self.randomValue(),
                    bloco: blocoI,
                    endereco: self.pad(enderecoI.toString(2), 8)
                };
                enderecoI++;
            }
        }


        self.cache_memory_init = function() {
            var quadroI = 0;
            for (var i = 0; i < 16; i++) {
                memoriaCache[i] = {
                    rotulo: 'XXX',
                    quadro: self.pad(quadroI.toString(2), 3),
                    celula0: 'X',
                    celula1: 'X',
                    celula2: 'X',
                    celula3: 'X',
                    sujo: 0,
                    valido: 0,
                    LRU: 0
                };
                if (i % 2 != 0)
                    quadroI++;
            }
        }

        self.main_memory = function() {
            if (memoriaPrincipal[0] == undefined)
                self.main_memory_init();
            else
                $('#mainMemory').html(" ");
            for (var i = 0; i < 256; i++) {
                $('#mainMemory').append(
                    '<tr>' +
                    '<td>' + memoriaPrincipal[i].endereco + '</td>' +
                    '<td>' + memoriaPrincipal[i].bloco + '</td>' +
                    '<td>' + memoriaPrincipal[i].word + '</td>' +
                    '</tr>'
                );
            }

        }

        self.cache_memory = function() {


            var check1, check2;

            if (memoriaCache[0] == undefined)
                self.cache_memory_init();
            else
                $('#cacheMemory').html(" ");
            for (var i = 0; i < 16; i++) {
                if (memoriaCache[i].sujo == 1) {
                    check1 = '<p><input type="checkbox" id="test6" checked="checked" disabled="disabled"/><label for="test6"></label></p>';
                } else {
                    check1 = '<p><input type="checkbox" id="test6"  disabled="disabled"/><label for="test6"></label></p>';
                }
                if (memoriaCache[i].valido == 1) {
                    check2 = '<p><input type="checkbox" id="test6" checked="checked" disabled="disabled"/><label for="test6"></label></p>';
                } else {
                    check2 = '<p><input type="checkbox" id="test6"  disabled="disabled"/><label for="test6"></label></p>';
                }
                $('#cacheMemory').append(
                    '<tr>' +
                    '<td>' + memoriaCache[i].rotulo + '</td>' +
                    '<td>' + memoriaCache[i].quadro + '</td>' +
                    '<td>' + memoriaCache[i].celula0 + '</td>' +
                    '<td>' + memoriaCache[i].celula1 + '</td>' +
                    '<td>' + memoriaCache[i].celula2 + '</td>' +
                    '<td>' + memoriaCache[i].celula3 + '</td>' +
                    '<td>' + check1 + '</td>' +
                    '<td>' + check2 + '</td>' +
                    '<td>' + memoriaCache[i].LRU + '</td>' +
                    '</tr>'
                );
            }

        }



        self.processorEvents = function() {
            var endereco;
            var endereco2;
            var dado;
            var bloco;
            var foudCache;
            var dadoToMain;
            $('#writeBtn').click(function() { //escrita
                endereco = $('#enderecoInput').val();
                dado = $('#dadoInput').val();
                if (!self.validateForms())
                    return;
                endereco = endereco.match(/.{1,3}/g);
                for (var i = 0; i < 16; i++) {
                    if (endereco[0] == memoriaCache[i].rotulo) {
                        if (endereco[1] == memoriaCache[i].quadro) {
                            foudCache = true;
                            if (endereco[2] == '00') {
                                memoriaCache[i].celula0 = dado;
                            } else if (endereco[2] == '01') {
                                memoriaCache[i].celula1 = dado;
                            } else if (endereco[2] == '10') {
                                memoriaCache[i].celula2 = dado;
                            } else {
                                memoriaCache[i].celula3 = dado;
                            }
                            memoriaCache[i].sujo = 1;
                            memoriaCache[i].valido = 1;
                            self.LRU(i);
                            self.writeHit();
                            break;
                        }

                    } else {
                        foudCache = false;
                    }
                }
                if (!foudCache) { //caso não achou na cache....
                    bloco = self.findMain(endereco);
                    for (var i = 0; i < 16; i++) {
                        if (endereco[1] == memoriaCache[i].quadro) { //right back
                            if (memoriaCache[i].rotulo != 'XXX' && memoriaCache[i + 1].rotulo == 'XXX') { //LRU
                                i++;
                            } else if (memoriaCache[i].rotulo != 'XXX' && memoriaCache[i + 1].rotulo != 'XXX' && memoriaCache[i].LRU < memoriaCache[i + 1].LRU) {
                                i++;
                            }
                            if (memoriaCache[i].rotulo != 'XXX') {
                                dadoToMain = [memoriaCache[i].celula0, memoriaCache[i].celula1, memoriaCache[i].celula2, memoriaCache[i].celula3];
                                endereco2 = memoriaCache[i].rotulo + endereco[1] + '00';
                                self.writeMain(dadoToMain, endereco2);
                            }
                            memoriaCache[i].rotulo = endereco[0];
                            memoriaCache[i].celula0 = bloco[0];
                            memoriaCache[i].celula1 = bloco[1];
                            memoriaCache[i].celula2 = bloco[2];
                            memoriaCache[i].celula3 = bloco[3];
                            if (endereco[2] == '00') {
                                memoriaCache[i].celula0 = dado;
                            } else if (endereco[2] == '01') {
                                memoriaCache[i].celula1 = dado;
                            } else if (endereco[2] == '10') {
                                memoriaCache[i].celula2 = dado;
                            } else {
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

            $('#readBtn').click(function() { //Leitura
                endereco = $('#enderecoInput').val();
                dado = $('#dadoInput').val();
                if (!self.validateForms())
                    return;
                endereco = endereco.match(/.{1,3}/g);
                for (var i = 0; i < 16; i++) {
                    if (endereco[0] == memoriaCache[i].rotulo) {
                        if (endereco[1] == memoriaCache[i].quadro) {
                            foudCache = true;
                            $('#dadoInput').focus();
                            if (endereco[2] == '00') {
                                $('#dadoInput').val(memoriaCache[i].celula0);
                            } else if (endereco[2] == '01') {
                                $('#dadoInput').val(memoriaCache[i].celula1);
                            } else if (endereco[2] == '10') {
                                $('#dadoInput').val(memoriaCache[i].celula2);
                            } else {
                                $('#dadoInput').val(memoriaCache[i].celula3);
                            }
                            memoriaCache[i].valido = 1;
                            self.LRU(i);
                            self.readHit();
                            break;
                        }

                    } else {
                        foudCache = false;
                    }
                }
                if (!foudCache) { //caso não achou na cache....
                    bloco = self.findMain(endereco);
                    for (var i = 0; i < 16; i++) {
                        if (endereco[1] == memoriaCache[i].quadro) { //right back
                            if (memoriaCache[i].rotulo != 'XXX' && memoriaCache[i + 1].rotulo == 'XXX') { //LRU
                                i++;
                            } else if (memoriaCache[i].rotulo != 'XXX' && memoriaCache[i + 1].rotulo != 'XXX' && memoriaCache[i].LRU < memoriaCache[i + 1].LRU) {
                                i++;
                            }
                            if (memoriaCache[i].rotulo != 'XXX') {
                                dadoToMain = [memoriaCache[i].celula0, memoriaCache[i].celula1, memoriaCache[i].celula2, memoriaCache[i].celula3];
                                endereco2 = memoriaCache[i].rotulo + endereco[1] + '00';
                                self.writeMain(dadoToMain, endereco2);
                            }
                            memoriaCache[i].rotulo = endereco[0];
                            memoriaCache[i].celula0 = bloco[0];
                            memoriaCache[i].celula1 = bloco[1];
                            memoriaCache[i].celula2 = bloco[2];
                            memoriaCache[i].celula3 = bloco[3];
                            $('#dadoInput').focus();
                            if (endereco[2] == '00') {
                                $('#dadoInput').val(memoriaCache[i].celula0);
                            } else if (endereco[2] == '01') {
                                $('#dadoInput').val(memoriaCache[i].celula1);
                            } else if (endereco[2] == '10') {
                                $('#dadoInput').val(memoriaCache[i].celula2);
                            } else {
                                $('#dadoInput').val(memoriaCache[i].celula3);
                            }
                            memoriaCache[i].valido = 1;
                            self.readMiss();
                            self.LRU(i);
                            break;
                        }
                    }
                }
                self.cache_memory();
            });
        }


        self.findMain = function(endereco) {
            var bloco;
            endereco = endereco[0].concat(endereco[1]);
            for (var i = 0; i < 256; i++) {
                if (endereco == memoriaPrincipal[i].endereco.substring(0, 6)) {
                    bloco = [memoriaPrincipal[i].word, memoriaPrincipal[i + 1].word, memoriaPrincipal[i + 2].word, memoriaPrincipal[i + 3].word];
                    break;
                }
            }
            return bloco;
        }

        self.writeMain = function(dados, endereco) {
            for (var i = 0; i < 256; i++) {
                if (memoriaPrincipal[i].endereco == endereco) {
                    memoriaPrincipal[i].word = dados[0];
                    memoriaPrincipal[i + 1].word = dados[1];
                    memoriaPrincipal[i + 2].word = dados[2];
                    memoriaPrincipal[i + 3].word = dados[3];
                    break;
                }
            }
            self.main_memory();

        }


        //LRU 

        self.LRU = function(k) {
            memoriaCache[k].LRU = 0;
            for (var i = 0; i < 16; i++) {
                if (i != k && memoriaCache[i].rotulo != 'XXX') {
                    memoriaCache[i].LRU++;
                }
            }
        }

        //Status

        self.writeMiss = function() {
            status1.Faltas++;
            status1.Faltas_Escrita++;
            status1.Escritas++;
            status1.Acessos++;
            self.updateStatus();

        }


        self.readMiss = function() {
            status1.Faltas++;
            status1.Faltas_Leitura++;
            status1.Leituras++;
            status1.Acessos++;
            self.updateStatus();
        }

        self.writeHit = function() {
            status1.Acertos++;
            status1.Acessos++;
            status1.Acertos_Escrita++;
            status1.Escritas++;
            self.updateStatus();
        }


        self.readHit = function() {
            status1.Acertos++;
            status1.Acessos++;
            status1.Acertos_Leitura++;
            status1.Leituras++;
            self.updateStatus();
        }

        self.updateStatus = function() {
            $('#statusInfo').html(' ');
            $('#statusInfo').append(
                '<span class="card-title">Estatísticas</span>' +
                '<p>Número de Acessos: ' + status1.Acessos + '</p>' +
                '<p>Número de Acertos: ' + status1.Acertos + '</p>' +
                '<p>Número de Faltas: ' + status1.Faltas + '</p>' +
                '<p>Número de Leituras: ' + status1.Leituras + '</p>' +
                '<p>Número de Escritas: ' + status1.Escritas + '</p>' +
                '<p>Número de Acertos na Leitura: ' + status1.Acertos_Leitura + '</p>' +
                '<p>Número de Acertos na Escrita: ' + status1.Acertos_Escrita + '</p>' +
                '<p>Número de Faltas na Leitura: ' + status1.Faltas_Leitura + '</p>' +
                '<p>Número de Faltas na Escrita: ' + status1.Faltas_Escrita + '</p>'
            );

        }

        //Funções Auxiliares 

        self.deleteAll = function() {
            $('#deleteAll').click(function() {
                $('#enderecoInput').val(null);
                $('#dadoInput').val(null);
                $('#enderecoInput').focusout();
                $('#dadoInput').focusout();
            });
        }


        self.statusRenew = function() {
            status1.Acessos = 0;
            status1.Acertos = 0;
            status1.Faltas = 0;
            status1.Leituras = 0;
            status1.Escritas = 0;
            status1.Acertos_Leitura = 0;
            status1.Acertos_Escrita = 0;
            status1.Faltas_Leitura = 0;
            status1.Faltas_Escrita = 0;
            self.updateStatus();
        }

        self.configs = function() {
            $('#renewAll').click(function() {
                self.main_memory_init();
                self.cache_memory_init();
                $('#deleteAll').click();
                self.statusRenew();
                self.cache_memory();
                self.main_memory();
            });
            $('#newMainValue').click(function() {
                self.main_memory_init();
                self.main_memory();
            });

        }

        self.validateForms = function() {
            if ($('#enderecoInput').val().length < 8 || $('#enderecoInput').val().length > 8) {
                Materialize.toast('Endreço Inválido! (Endreço deve conter 8 bits)', 2500);
                return false;
            }
            if (self.byteCount($('#dadoInput').val()) > 4) {
                Materialize.toast('Dado Inválido! (dado deve conter no máximo 4 bytes)', 2500);
                return false;
            }
            return true;
        }



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
            return s.substr(s.length - size);
        }


        return self;
    }(app || {}, jQuery));