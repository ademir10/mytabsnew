import react, { useState, useEffect } from "react";
import { KeyboardAvoidingView, Dimensions, FlatList, Modal, Pressable, ActivityIndicator, Image, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";
import SelectDropdown from 'react-native-select-dropdown'
import filter from 'lodash.filter';
const _ = require('lodash');
import Markdown, { MarkdownIt } from 'react-native-markdown-display';

export default function Tablaturas() {
    const navigation = useNavigation();

    const fadeInOpacity = useSharedValue(0);
    const fadeIn = () => {
        fadeInOpacity.value = withTiming(1, {
            duration: 1000,
            easing: Easing.linear,
        });
    };
    const fadeOut = () => {
        fadeInOpacity.value = withTiming(0, {
            duration: 1000,
            easing: Easing.linear,
        });
    };
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: fadeInOpacity.value, // Use the value directly
        };
    });
    const [dadosTab, setDadosTab] = useState([]);
    const [infoTab, setInfoTab] = useState([]);
    const [isSelectedCheckbox, setSelectionCheckbox] = useState(false);
    const [imageClient, setImageClient] = useState('sem_logo');
    let [isLoading, setIsLoading] = useState(false);
    let [error, setError] = useState();
    let [response, setResponse] = useState();
    const [dadosSession, setDadosSession] = useState([]);
    const [ramdom, setRamdom] = useState('?random+\=' + Math.random());
    const [tablaturas, setTablaturas] = useState();
    const [fullData, setFullData] = useState([]);
    const [tipoView, setTipoView] = useState();
    const [idSelected, setIdSelected] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalShowVisible, setModalShowVisible] = useState(false);
    const [nomeMusica, setNomeMusica] = useState();
    const [validNomeMusica, setValidNomeMusica] = useState('grey');
    const [listaUsuarios, setListaUsuarios] = useState();
    const [listaOpcoes, setListaOpcoes] = useState([{
        nome: 'Sim',
        value: 'Sim'
    }, {
        nome: 'Não',
        value: 'Não'
    }]);
    const [tabEspecial, setTabEspecial] = useState();
    const [validTabEspecial, setValidTabEspecial] = useState('grey');
    const [versao, setVersao] = useState();
    const [validVersao, setValidVersao] = useState('grey');
    const [tomOriginal, setTomOriginal] = useState();
    const [validTomOriginal, setValidTomOriginal] = useState('grey');
    const [tom, setTom] = useState();
    const [validTom, setValidTom] = useState('grey');
    const [capotraste, setCapotraste] = useState();
    const [ordemExecucao, setOrdemExecucao] = useState('grey');
    const [revisado, setRevisado] = useState();
    const [validRevisado, setValidRevisado] = useState('grey');
    const [bpms, setBpms] = useState();
    const [ativoParaCulto, setAtivoParaCulto] = useState(false);
    const [linkYoutube, setLinkYoutube] = useState();
    const [validLinkYoutube, setValidLinkYoutube] = useState('grey');
    const [letra, setLetra] = useState();
    const [validLetra, setValidLetra] = useState('grey');

    //code used to searchBar
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = (query) => {
        setSearchQuery(query);
        const formattedQuery = query.toLowerCase();

        const filteredData = filter(fullData, (data) => {
            return contains(data, formattedQuery);
        });
        setTablaturas(filteredData);

    }

    const contains = ({ nome_musica, versao }, query) => {
        if (
            nome_musica.toLowerCase().includes(query) ||
            versao.toLowerCase().includes(query)
        ) {
            return true;
        }
        return false;
    }

    function fecharModalShow(data) {
        if (data) {
            setDadosTab(data.tab);
            setModalShowVisible(!modalShowVisible);

            const fetchData = async () => {
                var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session');
                var dadosSessao = JSON.parse(infoData);

                var dados = JSON.stringify({
                    id: data.tab.id,
                    tipo_view: data.tipo_view
                })

                var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
                var config = JSON.parse(ApiConfig);

                const timeout = new Promise((resolve, reject) => {
                    setTimeout(reject, 5000, 'Request timed out');
                });
                var url = config.address_api + '/pages/crud_tablaturas';
                const request = fetch(url, {
                    method: 'POST',
                    body: dados,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                })
                    .then((response) => response.json())
                    .then(
                        (retorno_API) => {

                            setIsLoading(false);
                            setResponse(retorno_API);
                            if (retorno_API.erro == 'sim') {
                                setNomeMusica('');
                                fecharModal()
                                Alert.alert('Aviso:', retorno_API.mensagem, [{ text: 'OK', onPress: () => null },]);
                            } else {
                                setInfoTab(retorno_API.tab.letra);
                            }
                        }, (error) => {
                            setIsLoading(false);
                            Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique sua conexão com a internet e se persistir avise o nosso suporte.', [{ text: 'OK', onPress: () => fecharModal() },]);
                        }
                    )
                try {
                    const response = await Promise
                        .race([timeout, request]);
                    return true;
                }
                catch (error) {
                    console.log(error);
                    setIsLoading(false);
                    Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique a sua conexão com a internet e se os dados informados estão corretos.', [{ text: 'OK' },]);
                }
            }
            fetchData().catch(console.error);



        } else {
            setDadosTab([]);
            setModalShowVisible(!modalShowVisible);
        }
    }

    function fecharModal(dados) {

        if (dados) {
            setIdSelected(dados.tablatura.id);
            setTabEspecial(dados.tablatura.special_tab);
            setNomeMusica(dados.tablatura.nome_musica);
            setTomOriginal(dados.tablatura.tom_original);
            setTom(dados.tablatura.tom);
            setCapotraste(dados.tablatura.capotraste);
            setOrdemExecucao(dados.tablatura.ordem_exibicao);
            setRevisado(dados.tablatura.revisado);
            setBpms(dados.tablatura.bpms);
            setAtivoParaCulto(dados.tablatura.ativo_para_culto);
            setVersao(dados.tablatura.versao);
            setLinkYoutube(dados.tablatura.link_youtube);
            setLetra(dados.tablatura.letra);
            setTipoView('Editar');
        } else {
            setTabEspecial('');
            setNomeMusica('');
            setTomOriginal('');
            setTom('');
            setCapotraste('');
            setOrdemExecucao('');
            setRevisado('');
            setBpms('');
            setAtivoParaCulto(false);
            setVersao('');
            setLinkYoutube('');
            setLetra('');
            setTipoView('Novo');
        }
        setModalVisible(!modalVisible);

    }

    const spinnerPage = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }} color="orange" />;
        }
        if (error) {
            return <Text>{error}</Text>
        }
    }

    useEffect(() => {
        if (!tabEspecial || tabEspecial.length < 1) {
            setValidTabEspecial('#ff7401')
        } else {
            setValidTabEspecial('grey')
        }

        if (!versao || versao.length < 1) {
            setValidVersao('#ff7401')
        } else {
            setValidVersao('grey')
        }

        if (!nomeMusica || nomeMusica.length < 3) {
            setValidNomeMusica('#ff7401')
        } else {
            setValidNomeMusica('grey')
        }

        if (!tomOriginal || tomOriginal.length < 3) {
            setValidTomOriginal('#ff7401')
        } else {
            setValidTomOriginal('grey')
        }

        if (!tom || tom.length < 1) {
            setValidTom('#ff7401')
        } else {
            setValidTom('grey')
        }

        if (!revisado || revisado.length < 3) {
            setValidRevisado('#ff7401')
        } else {
            setValidRevisado('grey')
        }

        if (!linkYoutube || linkYoutube.length < 3) {
            setValidLinkYoutube('#ff7401')
        } else {
            setValidLinkYoutube('grey')
        }

        if (!letra || letra.length < 3) {
            setValidLetra('#ff7401')
        } else {
            setValidLetra('grey')
        }

    }, [nomeMusica, tabEspecial, versao, tomOriginal, tom, revisado, linkYoutube, letra]);

    useEffect(() => {
        fadeIn();
        const getData = async () => {
            var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session')
            let dadosSessao = JSON.parse(infoData);

            var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
            var config = JSON.parse(ApiConfig);
            setImageClient(config.thumb_caminho_imagem);

            //Buscando tablaturas cadastrados
            const timeout = new Promise((resolve, reject) => {
                setTimeout(reject, 5000, 'Request timed out');
            });
            var url = config.address_api + '/pages/index_tablaturas';
            const request = fetch(url, {
                method: 'POST',
                body: JSON.stringify({
                    app: 'Sim'
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
                .then((response) => response.json())
                .then(
                    (result) => {
                        setResponse(result);
                        setFullData(result.tablaturas);

                        if (result.tablaturas != 'nada') {
                            setTablaturas(result.tablaturas);
                            setListaUsuarios(result.usuarios);
                        } else {
                            setTablaturas(null);
                            setUsuarios(null);
                        }
                        setIsLoading(false);
                    }, (error) => {
                        setIsLoading(false);
                        Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique sua conexão com a internet e se persistir avise o nosso suporte.', [{ text: 'OK', onPress: () => navigation.navigate('SignIn') },]);
                    }
                )
            try {
                const response = await Promise
                    .race([timeout, request]);
                return true;
            }
            catch (error) {
                console.log(error);
                setIsLoading(false);
                Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique a sua conexão com a internet e se os dados informados estão corretos.', [{ text: 'OK' },]);
            }
        }
        getData().catch(console.error);
    }, []);

    const handleSubmit = (data) => {
        //Verifica se todos os campos foram validados antes de enviar os dados para a API
        if (validNomeMusica === '#ff7401' && data.tipo_view != 'Excluir'
            || validVersao === '#ff7401' && data.tipo_view != 'Excluir'
            || validTomOriginal === '#ff7401' && data.tipo_view != 'Excluir'
            || validTom === '#ff7401' && data.tipo_view != 'Excluir'
            || validRevisado === '#ff7401' && data.tipo_view != 'Excluir'
            || validLinkYoutube === '#ff7401' && data.tipo_view != 'Excluir'
            || validLetra === '#ff7401' && data.tipo_view != 'Excluir'
        ) {
            Alert.alert('Erros de validação:', 'Por favor verifique os campos na cor laranja.');
            return;
        }

        //Send data to API
        Alert.alert('Tudo pronto:', 'Podemos confirmar?'
            , [
                {
                    text: 'Cancelar',
                    onPress: () => null,
                    style: 'cancel',
                },
                {
                    text: 'Sim', onPress: () => {
                        setIsLoading(true);

                        const fetchData = async () => {
                            var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session');
                            var dadosSessao = JSON.parse(infoData);

                            if (data.tipo_view == 'Excluir') {
                                var dados = JSON.stringify({
                                    id: data.id,
                                    nome_musica: data.nome_musica,
                                    usuario_logado: dadosSessao.usuario,
                                    tipo_view: 'Excluir'
                                })
                            } else {
                                var dados = JSON.stringify({
                                    id: idSelected,
                                    usuario_logado: dadosSessao.usuario,
                                    tipo_view: tipoView,
                                    versao: versao,
                                    nome_musica: nomeMusica,
                                    tom: tom,
                                    capotraste: capotraste,
                                    ordem_exibicao: ordemExecucao,
                                    ativo_para_culto: ativoParaCulto,
                                    letra: letra,
                                    link_youtube: linkYoutube,
                                    revisado: revisado,
                                    tom_original: tomOriginal,
                                    special_tab: tabEspecial,
                                    bpms: bpms
                                })
                            }

                            console.log(tipoView);

                            var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
                            var config = JSON.parse(ApiConfig);

                            const timeout = new Promise((resolve, reject) => {
                                setTimeout(reject, 5000, 'Request timed out');
                            });
                            var url = config.address_api + '/pages/crud_tablaturas';
                            const request = fetch(url, {
                                method: 'POST',
                                body: dados,
                                headers: {
                                    'Content-type': 'application/json; charset=UTF-8',
                                },
                            })
                                .then((response) => response.json())
                                .then(
                                    (retorno_API) => {

                                        setIsLoading(false);
                                        setResponse(retorno_API);
                                        if (retorno_API.erro == 'sim') {
                                            setTablaturas(retorno_API.list_updated);
                                            fecharModal()
                                            Alert.alert('Aviso:', retorno_API.mensagem, [{ text: 'OK', onPress: () => null },]);
                                        } else {
                                            setTablaturas(retorno_API.list_updated);
                                            if (retorno_API.view_excluir == 'sim') {
                                                Alert.alert('Parabéns:', retorno_API.mensagem, [{ text: 'OK', onPress: () => null },]);
                                            } else {
                                                setTablaturas(retorno_API.list_updated);
                                                fecharModal()
                                                Alert.alert('Parabéns:', retorno_API.mensagem, [{ text: 'OK', onPress: () => null },]);
                                            }

                                        }
                                    }, (error) => {
                                        setIsLoading(false);
                                        Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique sua conexão com a internet e se persistir avise o nosso suporte.', [{ text: 'OK', onPress: () => fecharModal() },]);
                                    }
                                )
                            try {
                                const response = await Promise
                                    .race([timeout, request]);
                                return true;
                            }
                            catch (error) {
                                console.log(error);
                                setIsLoading(false);
                                Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique a sua conexão com a internet e se os dados informados estão corretos.', [{ text: 'OK' },]);
                            }
                        }
                        fetchData().catch(console.error);
                    }
                },
            ]);
    }

    const checkAtivoCulto = (data) => {

        const fetchData = async () => {
            var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session');
            var dadosSessao = JSON.parse(infoData);

            var dados = JSON.stringify({
                id: data.id,
                ativo_culto: data.checkboxCondition,
                tipo_view: 'update_culto_ativo'
            })

            var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
            var config = JSON.parse(ApiConfig);

            const timeout = new Promise((resolve, reject) => {
                setTimeout(reject, 5000, 'Request timed out');
            });
            var url = config.address_api + '/pages/crud_tablaturas';
            const request = fetch(url, {
                method: 'POST',
                body: dados,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })
                .then((response) => response.json())
                .then(
                    (retorno_API) => {
                        setIsLoading(false);
                        setResponse(retorno_API);
                        if (retorno_API.erro == 'sim') {
                            setNomeMusica('');
                            fecharModal()
                            Alert.alert('Aviso:', retorno_API.mensagem, [{ text: 'OK', onPress: () => null },]);
                        }
                    }, (error) => {
                        setIsLoading(false);
                        Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique sua conexão com a internet e se persistir avise o nosso suporte.', [{ text: 'OK', onPress: () => fecharModal() },]);
                    }
                )
            try {
                const response = await Promise
                    .race([timeout, request]);
                return true;
            }
            catch (error) {
                console.log(error);
                setIsLoading(false);
                Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique a sua conexão com a internet e se os dados informados estão corretos.', [{ text: 'OK' },]);
            }
        }
        fetchData().catch(console.error);
    }

    async function deixar_negrito() {

    }


    return (

        <Animated.View
            style={[
                styles.container,
                animatedStyle,
            ]}>

            <View style={styles.topImageContainer}>
                <Image
                    source={require("../../assets/top2.png")}
                    style={styles.topImage}
                />

                <View style={styles.logoPosition}>
                    {imageClient == "sem_logo" ? (
                        <Image
                            style={{ flex: 1, position: 'absolute', width: 50, height: 50, resizeMode: 'contain' }}
                            source={require('../../assets/logo-intro.png')} />
                    ) :
                        <Image
                            style={{ flex: 1, position: 'absolute', width: 50, height: 50, resizeMode: 'contain' }}
                            source={{ uri: imageClient + ramdom.replace(/^["'](.+(?=["']$))["']$/, '$1') }}
                        />
                    }
                </View>
            </View>

            <View style={styles.containerForm}>
                {spinnerPage()}

                {response ? (
                    <View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.textMenu}>Cadastro de Tablaturas</Text>
                        </View>
                        <TextInput
                            value={searchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor="grey"
                            placeholder='Buscar por nome ou versão..'
                            clearButtonMode='always'
                            style={styles.SearchBox}
                            onChangeText={query => handleSearch(query)}
                        />
                        <View style={{ position: 'absolute', right: 0 }}>
                            <TouchableOpacity
                                onPress={() => fecharModal()}
                                style={{
                                    borderRadius: 5,
                                    borderWidth: 1,
                                    borderColor: "#006059"
                                }}
                            >
                                <Image source={require('../../assets/buttons/btn-new.png')} style={{
                                    width: 25, height: 25, resizeMode: 'contain'
                                }} />
                            </TouchableOpacity>
                        </View>

                        {tablaturas.length > 0 ? (

                            <View style={styles.formatBackground}>
                                <View style={{ paddingBottom: 160 }}>
                                    <FlatList nestedScrollEnabled
                                        data={tablaturas}
                                        ItemSeparatorComponent={
                                            <View
                                                style={{
                                                    width: '100%',
                                                    borderBottomWidth: 0.5,
                                                    borderColor: '#cecece'
                                                }}
                                            />
                                        }
                                        showsVerticalScrollIndicator={false}

                                        renderItem={({ item, index }) => (
                                            <View>
                                                <View style={{ paddingVertical: 5 }}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <View style={{ flex: 0.7 }}>
                                                            <TouchableOpacity
                                                                onPress={() => fecharModalShow({ tab: item, tipo_view: 'info_tab' })}>
                                                                <Text numberOfLines={1} style={{ color: 'black', fontFamily: 'EncodeSans-Light', fontSize: 16 }}>{item.nome_musica}</Text>
                                                                <Text numberOfLines={1} style={{ color: 'grey', fontFamily: 'EncodeSans-Light', fontSize: 14 }}>Versão {item.versao} {item.special_tab == "Sim" ? (<Text>Capo {item.capotraste}</Text>) : null}
                                                                    {item.multitrack ? (<Image source={require('../../assets/multitrack.png')} style={{ width: 13, height: 13 }} />) : null}</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                        <View style={{ flex: 0.3 }}>
                                                            <View style={{ position: 'absolute', right: 59, paddingTop: 6 }}>
                                                                <BouncyCheckbox
                                                                    isChecked={item.ativo_para_culto}
                                                                    size={30}
                                                                    fillColor="#fe9701"
                                                                    unFillColor="transparent"
                                                                    iconStyle={{ borderColor: "white" }}
                                                                    innerIconStyle={{ borderWidth: 1 }}
                                                                    onPress={(isChecked) => { checkAtivoCulto({ id: item.id, checkboxCondition: isChecked }) }}
                                                                />
                                                            </View>

                                                            <View style={{ position: 'absolute', right: 38, paddingTop: 4 }}>
                                                                <TouchableOpacity
                                                                    onPress={() => fecharModal({ tablatura: item })}
                                                                    style={{
                                                                        borderRadius: 5,
                                                                        borderWidth: 1,
                                                                        borderColor: "#006059"
                                                                    }}
                                                                >
                                                                    <Image source={require('../../assets/buttons/btn-edit.png')} style={{
                                                                        width: 30, height: 30, resizeMode: 'contain'
                                                                    }} />
                                                                </TouchableOpacity>
                                                            </View>

                                                            <View style={{ position: 'absolute', right: 0, paddingTop: 4 }}>
                                                                <TouchableOpacity
                                                                    onPress={() => handleSubmit({ tipo_view: 'Excluir', id: item.id, nome_musica: item.nome_musica })}
                                                                    style={{
                                                                        borderRadius: 5,
                                                                        borderWidth: 1,
                                                                        borderColor: "#006059"
                                                                    }}
                                                                >
                                                                    <Image source={require('../../assets/buttons/btn-delete.png')} style={{
                                                                        width: 30, height: 30, resizeMode: 'contain'
                                                                    }} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                        ListFooterComponent={
                                            <View
                                                style={{
                                                    width: '100%',
                                                    borderBottomWidth: 0.8,
                                                    borderColor: 'grey'
                                                }}
                                            />
                                        }
                                    />
                                </View>
                            </View>
                        ) :
                            <View style={{ alignContent: 'center', alignItems: 'center' }}>
                                <Text style={{ padding: 10, fontFamily: 'EncodeSans-Light', fontSize: 20, color: 'grey' }}>Não encontramos nenhum registro</Text>
                                <Image source={require('../../assets/nadaEncontrado.png')}></Image>
                            </View>
                        }
                    </View>
                ) : <View style={styles.centered}>{spinnerPage()}</View>}
            </View>

            <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={styles.buttonClose}
                    keyboardType='numeric'
                    maxLength={10}>
                    <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 20, color: 'white' }}>Voltar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.centeredView}>

                { /* SHOW VIEW */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalShowVisible}
                    onRequestClose={() => {
                        setModalShowVisible(!modalShowVisible);
                    }}>

                    <View style={styles.modalView}>

                        <View style={{ flexDirection: 'row', padding: 10, alignSelf: 'center' }}>
                            <Text style={styles.textMenu}>Informações</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>

                            <View style={styles.formatBackground}>
                                <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Música: {dadosTab.nome_musica}</Text>
                                <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Versão: {dadosTab.versao}</Text>
                                <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Tom original: {dadosTab.tom_original}</Text>
                                <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Tom: {dadosTab.tom}</Text>
                                {dadosTab.ordem_exibicao ? <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Ordem exibição: {dadosTab.ordem_exibicao}</Text> : null}
                                {dadosTab.bpms ? <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Bpms: {dadosTab.bpms}</Text> : null}

                                <Text style={{ fontFamily: 'EncodeSans-Light', paddingTop: 10, marginBottom: -10, fontSize: 20 }}>Tablatura: {'\n'}</Text>
                                <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5, flexShrink: 1, fontSize: 20 }}>
                                    <Markdown
                                        style={{
                                            body: { fontFamily: 'EncodeSans-Light' },
                                            heading1: { color: 'purple' },
                                            code_block: { color: 'black', fontSize: 14 }
                                        }}
                                        markdownit={MarkdownIt({ typographer: true }).disable([
                                            'autolink',
                                            'backticks',
                                            'entity',
                                            'escape',
                                            'html_inline',
                                            'image',
                                            'link',
                                            'newline',
                                            'text',
                                            'heading',
                                            'lheading',
                                            'list',
                                            'reference'
                                        ])
                                        }>
                                        {infoTab}
                                    </Markdown>
                                </Text>
                            </View>

                        </ScrollView>
                    </View>

                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                            onPress={() => setModalShowVisible(!modalShowVisible)}
                            style={styles.buttonClose}
                            keyboardType='numeric'
                            maxLength={10}>
                            <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 20, color: 'white' }}>Voltar</Text>
                        </TouchableOpacity>
                    </View>

                </Modal>

                { /* VIEWS NEW / EDIT */}

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}>

                        <View style={styles.modalView}>

                            <Pressable
                                style={[styles.buttonFechaModal]}
                                onPress={() => fecharModal()}>
                                <Text style={styles.textStyle}>X</Text>
                            </Pressable>

                            <View style={{ flexDirection: 'row', padding: 10, alignSelf: 'center' }}>
                                <Text style={styles.textMenu}>{tipoView} Tablatura</Text>
                            </View>

                            <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 10 }}>
                                Para a validação dos dados preencha os campos na cor laranja que são obrigatórios.
                            </Text>

                            <ScrollView showsVerticalScrollIndicator={false}>

                                <View style={styles.formatBackground}>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: validTabEspecial, fontFamily: 'EncodeSans-Light' }}>Tablatura especial:</Text>
                                            </View>
                                            <View style={styles.inputContainerDropBox}>

                                                <SelectDropdown
                                                    data={listaOpcoes}
                                                    defaultButtonText={'Selecione:'}
                                                    onSelect={(selectedItem, index) => {
                                                        setTabEspecial(selectedItem.nome)
                                                    }}
                                                    renderButton={(selectedItem, isOpen) => {
                                                        return (
                                                            <View style={styles.dropdownButtonStyle}>
                                                                <Text style={styles.dropdownButtonTxtStyle}>{tabEspecial ? tabEspecial : 'Selecione:'}</Text>
                                                            </View>
                                                        );
                                                    }}
                                                    renderItem={(item, index, isSelected) => {
                                                        return (
                                                            <View
                                                                style={{
                                                                    ...styles.dropdownItemStyle,
                                                                    ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                                                }}>
                                                                <Text style={styles.dropdown1BtnTxtStyle}>{item.nome}</Text>
                                                            </View>
                                                        );
                                                    }}
                                                    buttonStyle={styles.dropdown1BtnStyle}
                                                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                                                />

                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 8 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: validVersao, fontFamily: 'EncodeSans-Light' }}>Versão (quem vai cantar):</Text>
                                            </View>
                                            <View style={styles.inputContainerDropBox}>

                                                <SelectDropdown
                                                    data={listaUsuarios}
                                                    defaultButtonText={'Selecione:'}
                                                    onSelect={(selectedItem, index) => {
                                                        setVersao(selectedItem.name)
                                                    }}
                                                    renderButton={(selectedItem, isOpen) => {
                                                        return (
                                                            <View style={styles.dropdownButtonStyle}>
                                                                <Text style={styles.dropdownButtonTxtStyle}>{versao ? versao : 'Selecione:'}</Text>
                                                            </View>
                                                        );
                                                    }}
                                                    renderItem={(item, index, isSelected) => {
                                                        return (
                                                            <View
                                                                style={{
                                                                    ...styles.dropdownItemStyle,
                                                                    ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                                                }}>
                                                                <Text style={styles.dropdown1BtnTxtStyle}>{item.name}</Text>
                                                            </View>
                                                        );
                                                    }}
                                                    buttonStyle={styles.dropdown1BtnStyle}
                                                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                                                />

                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: validNomeMusica, fontFamily: 'EncodeSans-Light' }}>Nome musica:</Text>
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    fontFamily="EncodeSans-Light"
                                                    variant="outlined"
                                                    onChangeText={(text) => setNomeMusica(text)}
                                                    style={styles.input}
                                                    value={nomeMusica}
                                                    placeholder="Informe o nome original da musica"
                                                    placeholderTextColor={validNomeMusica}
                                                    color={validNomeMusica}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: validTomOriginal, fontFamily: 'EncodeSans-Light' }}>Tom original?</Text>
                                            </View>
                                            <View style={styles.inputContainerDropBox}>

                                                <SelectDropdown
                                                    data={listaOpcoes}
                                                    defaultButtonText={'Selecione:'}
                                                    onSelect={(selectedItem, index) => {
                                                        setTomOriginal(selectedItem.nome)
                                                    }}
                                                    renderButton={(selectedItem, isOpen) => {
                                                        return (
                                                            <View style={styles.dropdownButtonStyle}>
                                                                <Text style={styles.dropdownButtonTxtStyle}>{tomOriginal ? tomOriginal : 'Selecione:'}</Text>
                                                            </View>
                                                        );
                                                    }}
                                                    renderItem={(item, index, isSelected) => {
                                                        return (
                                                            <View
                                                                style={{
                                                                    ...styles.dropdownItemStyle,
                                                                    ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                                                }}>
                                                                <Text style={styles.dropdown1BtnTxtStyle}>{item.nome}</Text>
                                                            </View>
                                                        );
                                                    }}
                                                    buttonStyle={styles.dropdown1BtnStyle}
                                                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                                                />

                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: validTom, fontFamily: 'EncodeSans-Light' }}>Tom:</Text>
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    fontFamily="EncodeSans-Light"
                                                    variant="outlined"
                                                    onChangeText={(text) => setTom(text)}
                                                    style={styles.input}
                                                    value={tom}
                                                    placeholder="Informe o tom da musica"
                                                    placeholderTextColor={validTom}
                                                    color={validTom}
                                                    maxLength={5}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light' }}>Capotraste:</Text>
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    fontFamily="EncodeSans-Light"
                                                    variant="outlined"
                                                    onChangeText={(text) => setCapotraste(text)}
                                                    style={styles.input}
                                                    value={capotraste}
                                                    placeholder="Opcional Ex: 1ª, 2ª, 3ª, 4ª..."
                                                    placeholderTextColor={'grey'}
                                                    color={'grey'}
                                                    maxLength={5}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light' }}>Ordem execução:</Text>
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    fontFamily="EncodeSans-Light"
                                                    variant="outlined"
                                                    onChangeText={(text) => setOrdemExecucao(text)}
                                                    style={styles.input}
                                                    value={ordemExecucao}
                                                    placeholder="Opcional, Ex: 1, 2, 3, 4..."
                                                    placeholderTextColor={'grey'}
                                                    color={'grey'}
                                                    maxLength={5}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: validRevisado, fontFamily: 'EncodeSans-Light' }}>Já revisada?</Text>
                                            </View>
                                            <View style={styles.inputContainerDropBox}>

                                                <SelectDropdown
                                                    data={listaOpcoes}
                                                    defaultButtonText={'Selecione:'}
                                                    onSelect={(selectedItem, index) => {
                                                        setRevisado(selectedItem.nome)
                                                    }}
                                                    renderButton={(selectedItem, isOpen) => {
                                                        return (
                                                            <View style={styles.dropdownButtonStyle}>
                                                                <Text style={styles.dropdownButtonTxtStyle}>{revisado ? revisado : 'Selecione:'}</Text>
                                                            </View>
                                                        );
                                                    }}
                                                    renderItem={(item, index, isSelected) => {
                                                        return (
                                                            <View
                                                                style={{
                                                                    ...styles.dropdownItemStyle,
                                                                    ...(isSelected && { backgroundColor: '#D2D9DF' }),
                                                                }}>
                                                                <Text style={styles.dropdown1BtnTxtStyle}>{item.nome}</Text>
                                                            </View>
                                                        );
                                                    }}
                                                    buttonStyle={styles.dropdown1BtnStyle}
                                                    buttonTextStyle={styles.dropdown1BtnTxtStyle}
                                                />

                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light' }}>Bpms:</Text>
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    fontFamily="EncodeSans-Light"
                                                    variant="outlined"
                                                    onChangeText={(text) => setBpms(text)}
                                                    style={styles.input}
                                                    value={bpms}
                                                    placeholder="Opcional, Ex: 77..."
                                                    placeholderTextColor={'grey'}
                                                    color={'grey'}
                                                    maxLength={3}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light' }}>Ativo para o culto?</Text>
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <BouncyCheckbox
                                                    isChecked={ativoParaCulto}
                                                    size={15}
                                                    fillColor="#fe9701"
                                                    unFillColor="transparent"
                                                    iconStyle={{ borderColor: "white" }}
                                                    innerIconStyle={{ borderWidth: 1 }}
                                                    style={{ padding: 8 }}
                                                    onPress={() => setAtivoParaCulto(!ativoParaCulto)}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: validLinkYoutube, fontFamily: 'EncodeSans-Light' }}>Link YouTube:</Text>
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    fontFamily="EncodeSans-Light"
                                                    variant="outlined"
                                                    onChangeText={(text) => setLinkYoutube(text)}
                                                    style={styles.input}
                                                    value={linkYoutube}
                                                    placeholder="Obrigatório, Ex: https://youtu.be/0Wf..."
                                                    placeholderTextColor={'grey'}
                                                    color={'grey'}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ paddingVertical: 10 }}>
                                        <View>
                                            <View style={styles.labelContainer}>
                                                <Text style={{ color: validLetra, fontFamily: 'EncodeSans-Light' }}>Informações Tablatura:</Text>
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    multiline
                                                    mode="outlined"
                                                    fontFamily="EncodeSans-Light"
                                                    variant="outlined"
                                                    onChangeText={(text) => setLetra(text)}
                                                    style={styles.input}
                                                    value={letra}
                                                    placeholder="Insira aqui a tablatura (Obrigatório)"
                                                    placeholderTextColor={'grey'}
                                                    color={'grey'}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                </View>
                            </ScrollView>

                            {spinnerPage()}
                            <View style={{ alignItems: 'flex-end' }}>
                                <TouchableOpacity
                                    onPress={() => handleSubmit({ view: { tipoView }, id: idSelected })}
                                    style={styles.button}>
                                    <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 16, color: 'white', paddingBottom: 5 }}>Salvar</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </KeyboardAvoidingView>
                </Modal>

            </View>

        </Animated.View >

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    formatButton2: {
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    containerBtn: {
        padding: 16,
        top: 170,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    topImage: {
        resizeMode: "stretch",
        width: "100%",
        height: 150,
    },
    textMenu: {
        textAlign: 'center',
        fontFamily: 'EncodeSans-Light',
        marginTop: 0,
        marginBottom: 0,
        fontSize: 20,
        color: "black",
    },
    //Aqui fica o conteúdo central da tela
    containerForm: {
        top: -20,
        flex: 1,
        paddingStart: '5%',
        paddingEnd: '5%',
    },
    modalView2: {
        margin: 0,
        justifyContent: 'flex-end',
        width: '100%',
        marginTop: 'auto',
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        }
    },
    buttonFechaModal: {
        position: 'absolute',
        right: 7,
        top: Platform.OS === 'ios' ? 50 : 5,
        backgroundColor: '#006059',
        borderRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
        zIndex: 10
    },
    textStyle: {
        color: 'white',
        textAlign: 'left',
        paddingHorizontal: 7,
        fontWeight: '400',
    },
    leftImageContainer: {
        position: 'fixed',
        bottom: 0,
        top: 270,
        left: 0,
        right: 0,
        zIndex: -1,
    },
    leftImage: {
        width: "100%",
        height: "70%",
    },
    buttonClose: {
        backgroundColor: '#006059',
        width: '100%',
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
    },
    txtButton: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        borderBottomWidth: 1,
        height: 40,
        marginBottom: 12,
        fontSize: 18,
        fontFamily: 'EncodeSans-Light',
        paddingTop: 10,
        borderColor: "transparent",
        color: 'black'
    },
    seperator: {
        width: '100%',
        borderBottomWidth: 1,
        borderColor: 'red'
    },
    modalContainer: {
        height: Dimensions.get('window').height,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    centeredView: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',

    },
    modalView: {
        margin: 0,
        justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
        marginTop: 'auto',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingTop: 40,
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 50,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    labelContainer: {
        backgroundColor: "white", // Same color as background
        alignSelf: "flex-start", // Have View be same width as Text inside
        paddingHorizontal: 3, // Amount of spacing between border and first/last letter
        marginStart: 10, // How far right do you want the label to start
        zIndex: 1, // Label must overlap border
        elevation: 1, // Needed for android
        shadowColor: "white", // Same as background color because elevation: 1 creates a shadow that we don't want
        position: "absolute", // Needed to be able to precisely overlap label with border
        top: -12, // Vertical position of label. Eyeball it to see where label intersects border.
    },
    inputContainer: {
        backgroundColor: 'white',
        minWidth: '100%',
        minHeight: Platform.OS === 'ios' ? 40 : 0, // Adicionado para ajustar o tamannho do input na parte interna
        paddingLeft: Platform.OS === 'ios' ? 10 : 10, // Adicionado para ajustar o tamannho do input na parte interna
        paddingTop: Platform.OS === 'ios' ? 10 : 0, // Adicionado para ajustar o tamannho do input na parte interna

        borderWidth: 1, // Create border
        borderRadius: 8,
        zIndex: 0, // Ensure border has z-index of 0
        borderColor: '#ededed',
        fontFamily: 'EncodeSans-Light',
        fontSize: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
    },
    inputContainerDropBox: {
        backgroundColor: 'white',
        minWidth: '100%',
        minHeight: 40,
        borderWidth: 1, // Create border
        borderRadius: 8,
        zIndex: 0, // Ensure border has z-index of 0
        borderColor: '#ededed',
        fontFamily: 'EncodeSans-Light',
        fontSize: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
    },
    button: {
        backgroundColor: '#006059',
        width: '20%',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 2,
        marginTop: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdown1BtnStyle: {
        width: '100%',
        height: 50,
        backgroundColor: '#FFF',
        borderColor: 'white',
        borderRadius: 8,
    },
    dropdown1BtnTxtStyle: { color: '#444', textAlign: 'left' },
    dropdown1DropdownStyle: { backgroundColor: '#EFEFEF' },
    dropdown1RowStyle: { backgroundColor: '#EFEFEF', borderBottomColor: '#C5C5C5' },
    dropdown1RowTxtStyle: { color: '#444', textAlign: 'left' },
    dropdown1SelectedRowStyle: { backgroundColor: 'rgba(0,0,0,0.1)' },
    dropdown1searchInputStyleStyle: {
        backgroundColor: '#EFEFEF',
        borderRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    dropdownButtonStyle: {
        flex: 1,
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'left',
        paddingHorizontal: 12,
        paddingTop: 10,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 16,

        color: 'grey',
        textAlign: 'left',
    },
    dropdownItemStyle: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#B1BDC8',
    },
    SearchBox: {
        marginTop: 5,
        color: 'grey',
        backgroundColor: "#FFF",
        fontFamily: 'EncodeSans-Light',
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderColor: '#f7f7f7',
        borderWidth: 1,
        borderRadius: 8,

        width: '100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: Platform.OS === 'ios' ? 1 : 5,
    },
    logoPosition: {
        flexDirection: 'row',
        top: '-45%',
        flexWrap: 'wrap',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    }

})

