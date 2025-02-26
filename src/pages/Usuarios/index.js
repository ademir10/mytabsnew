import react, { useState, useEffect } from "react";
import { Dimensions, FlatList, Modal, Pressable, ActivityIndicator, Image, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import SelectDropdown from 'react-native-select-dropdown'
import filter from 'lodash.filter';
const _ = require('lodash');

export default function Usuarios() {
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

    const [imageClient, setImageClient] = useState('sem_logo');
    let [isLoading, setIsLoading] = useState(false);
    let [error, setError] = useState();
    let [response, setResponse] = useState();
    const [dadosSession, setDadosSession] = useState([]);
    const [ramdom, setRamdom] = useState('?random+\=' + Math.random());
    const [usuario, setUsuario] = useState();
    const [usuarios, setUsuarios] = useState();
    const [instrumentoId, setInstrumentoId] = useState();
    const [instrumento, setInstrumento] = useState();
    const [validInstrumento, setValidInstrumento] = useState('grey');
    const [opcaoInstrumentos, setOpcaoInstrumentos] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [nome, setNome] = useState();
    const [validNome, setValidNome] = useState('grey');
    const [email, setEmail] = useState();
    const [validEmail, setValidEmail] = useState('grey');
    const [password, setPassword] = useState();
    const [validPassword, setValidPassword] = useState('grey');
    const [typeAccess, setTypeAccess] = useState();
    const [validTypeAccess, setValidTypeAccess] = useState('grey');
    const [chkInstrumento, setChkInstrumento] = useState(false);
    const [chkTablatura, setChkTablatura] = useState(false);
    const [chkUsuario, setChkUsuario] = useState(false);
    const [chkLog, setChkLog] = useState(false);
    const [chkTabEspecial, setChkTabEspecial] = useState(false);
    const [chkBpms, setChkBpms] = useState(false);
    const [chkOrdemExibicao, setChkOrdemExibicao] = useState(false);
    const [chkMultitrack, setChkMultitrack] = useState(false);
    const [tipoView, setTipoView] = useState();
    const [idSelected, setIdSelected] = useState();
    const [modalShowVisible, setModalShowVisible] = useState(false);
    const [fullData, setFullData] = useState([]);
    const [opcaoTypeAccess, setOpcaoTypeAccess] = useState([{
        nome: 'MASTER',
        value: 'MASTER'
    }, {
        nome: 'ADMIN',
        value: 'ADMIN'
    }, {
        nome: 'USER',
        value: 'USER'
    }
    ]);

    //code used to searchBar
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = (query) => {
        setSearchQuery(query);
        const formattedQuery = query.toLowerCase();

        const filteredData = filter(fullData, (data) => {
            return contains(data, formattedQuery);
        });
        setUsuarios(filteredData);

    }

    const contains = ({ name }, query) => {
        if (
            name.toLowerCase().includes(query)
        ) {
            return true;
        }
        return false;
    }

    function fecharModalShow(data) {

        if (data) {
            setModalShowVisible(!modalShowVisible);

            const fetchData = async () => {
                var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session');
                var dadosSessao = JSON.parse(infoData);

                var dados = JSON.stringify({
                    id: data.user.id,
                    tipo_view: data.tipo_view
                })

                var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
                var config = JSON.parse(ApiConfig);

                const timeout = new Promise((resolve, reject) => {
                    setTimeout(reject, 5000, 'Request timed out');
                });
                var url = config.address_api + '/pages/crud_usuarios';
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
                                fecharModal()
                                Alert.alert('Aviso:', retorno_API.mensagem, [{ text: 'OK', onPress: () => null },]);
                            } else {
                                setUsuario(retorno_API.usuario);
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
            console.log('VER TAMBÉM AQUI QUANDO PASSA POR AQUI!!!');
            setModalShowVisible(!modalShowVisible);
        }
    }

    function fecharModal(dados) {
        if (dados) {
            setIdSelected(dados.user.id);
            setNome(dados.user.name);
            setEmail(dados.user.email);
            setPassword(dados.user.password);
            setInstrumentoId(dados.user.instrumento_id.id);
            setInstrumento(dados.user.instrumento_id.nome);
            setTypeAccess(dados.user.type_access);
            setChkInstrumento(dados.user.check_instrumento);
            setChkTablatura(dados.user.check_tablatura);
            setChkUsuario(dados.user.check_usuario);
            setChkLog(dados.user.check_log);
            setChkTabEspecial(dados.user.check_tab_especial);
            setChkBpms(dados.user.check_bpms);
            setChkOrdemExibicao(dados.user.check_ordem_exibicao);
            setChkMultitrack(dados.user.check_executar_multitracks);
            setTipoView('Editar');
        } else {
            setNome('');
            setEmail('');
            setPassword('');
            setInstrumentoId('');
            setInstrumento('Selecione:');
            setTypeAccess('Selecione:');
            setChkInstrumento(false);
            setChkTablatura(false);
            setChkUsuario(false);
            setChkLog(false);
            setChkTabEspecial(false);
            setChkBpms(false);
            setChkOrdemExibicao(false);
            setChkMultitrack(false);
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
        if (!nome || nome.length < 3) {
            setValidNome('#ff7401')
        } else {
            setValidNome('grey')
        }

        if (!email || email.length < 3) {
            setValidEmail('#ff7401')
        } else {
            setValidEmail('grey')
        }

        if (!password || password.length < 1) {
            setValidPassword('#ff7401')
        } else {
            setValidPassword('grey')
        }

        if (!instrumento || instrumento == 'Selecione:') {
            setValidInstrumento('#ff7401')
        } else {
            setValidInstrumento('grey')
        }

        if (!typeAccess || typeAccess == 'Selecione:') {
            setValidTypeAccess('#ff7401')
        } else {
            setValidTypeAccess('grey')
        }
    }, [nome, email, password, typeAccess, instrumento]);

    useEffect(() => {
        fadeIn();
        const getData = async () => {
            var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session')
            let dadosSessao = JSON.parse(infoData);

            var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
            var config = JSON.parse(ApiConfig);
            setImageClient(config.thumb_caminho_imagem);

            //Buscando usuarios cadastrados
            const timeout = new Promise((resolve, reject) => {
                setTimeout(reject, 5000, 'Request timed out');
            });
            var url = config.address_api + '/pages/index_usuarios';
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
                        setFullData(result.usuarios);

                            setUsuarios(result.usuarios);
                            setOpcaoInstrumentos(result.instrumentos);
                        
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
        if (validNome === '#ff7401' && data.tipo_view != 'Excluir'
            || validEmail === '#ff7401' && data.tipo_view != 'Excluir'
            || validPassword === '#ff7401' && data.tipo_view != 'Excluir'
            || validInstrumento === '#ff7401' && data.tipo_view != 'Excluir'
            || validTypeAccess === '#ff7401' && data.tipo_view != 'Excluir'
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
                                    nome: data.nome_item,
                                    usuario_logado: dadosSessao.usuario,
                                    tipo_view: 'Excluir'
                                })
                            } else {
                                var dados = JSON.stringify({
                                    id: idSelected,
                                    usuario_logado: dadosSessao.usuario,
                                    tipo_view: tipoView,
                                    name: nome,
                                    password: password,
                                    type_access: typeAccess,
                                    instrumento_id: instrumentoId,
                                    email: email,
                                    check_instrumento: chkInstrumento,
                                    check_tablatura: chkTablatura,
                                    check_usuario: chkUsuario,
                                    check_log: chkLog,
                                    check_tab_especial: chkTabEspecial,
                                    check_bpms: chkBpms,
                                    check_ordem_exibicao: chkOrdemExibicao,
                                    check_executar_multitracks: chkMultitrack
                                })
                            }

                            var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
                            var config = JSON.parse(ApiConfig);

                            const timeout = new Promise((resolve, reject) => {
                                setTimeout(reject, 5000, 'Request timed out');
                            });
                            var url = config.address_api + '/pages/crud_usuarios';
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
                                            setNome('');
                                            fecharModal()
                                            Alert.alert('Aviso:', retorno_API.mensagem, [{ text: 'OK', onPress: () => null },]);
                                        } else {
                                            setUsuarios(retorno_API.list_updated);
                                            if (retorno_API.view_excluir == 'sim') {
                                                Alert.alert('Parabéns:', retorno_API.mensagem, [{ text: 'OK', onPress: () => null },]);
                                            } else {
                                                setNome('');
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


    return (

        <Animated.View
            style={[
                styles.container,
                animatedStyle,
            ]}>

            <View style={styles.topImageContainer}>
                <Image
                    source={require("../../assets/top.png")}
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
                            <Text style={styles.textMenu}>Cadastro de Usuários</Text>
                        </View>
                        <TextInput
                            value={searchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor="grey"
                            placeholder='Buscar por nome..'
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

                        {usuarios.length > 0 ?(

                                <View style={styles.formatBackground}>
                                    <View style={styles.usuarios}>
                                        <View style={{ paddingBottom: 160 }}>
                                            <FlatList nestedScrollEnabled
                                                data={usuarios}
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
                                                keyExtractor={(item) => item.id.toString()}
                                                renderItem={({ item, index }) => (
                                                    <View>
                                                        <View style={{ paddingVertical: 5 }}>
                                                            <View style={{ flexDirection: 'row', padding: 8 }}>
                                                                <View>
                                                                    <TouchableOpacity onPress={() => fecharModalShow({ user: item, tipo_view: 'info_user' })}>
                                                                        <Text style={{ color: 'black', fontFamily: 'EncodeSans-Light', fontSize: 16 }}>{item.name}</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                                <View style={{ position: 'absolute', right: '10%', alignSelf: 'center' }}>
                                                                    <TouchableOpacity
                                                                        onPress={() => fecharModal({ user: item })}
                                                                        style={{
                                                                            borderRadius: 5,
                                                                            borderWidth: 1,
                                                                            borderColor: "#006059"
                                                                        }}
                                                                    >
                                                                        <Image source={require('../../assets/buttons/btn-edit.png')} style={{
                                                                            width: 25, height: 25, resizeMode: 'contain'
                                                                        }} />
                                                                    </TouchableOpacity>
                                                                </View>

                                                                <View style={{ position: 'absolute', right: 0, alignSelf: 'center' }}>
                                                                    <TouchableOpacity
                                                                        onPress={() => handleSubmit({ tipo_view: 'Excluir', id: item.id, nome_item: item.nome })}
                                                                        style={{
                                                                            borderRadius: 5,
                                                                            borderWidth: 1,
                                                                            borderColor: "#006059"
                                                                        }}
                                                                    >
                                                                        <Image source={require('../../assets/buttons/btn-delete.png')} style={{
                                                                            width: 25, height: 25, resizeMode: 'contain'
                                                                        }} />
                                                                    </TouchableOpacity>
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

                {usuario ? (
                    <View>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={modalShowVisible}
                            onRequestClose={() => {
                                setModalShowVisible(!modalShowVisible);
                            }}>

                            <View style={styles.modalView}>

                                <View style={{ flexDirection: 'row', padding: 10, alignSelf: 'center' }}>
                                    <Text style={styles.textMenu}>Usuário</Text>
                                </View>

                                <Pressable
                                    style={[styles.buttonFechaModal]}
                                    onPress={() => setModalShowVisible(!modalShowVisible)}>
                                    <Text style={styles.textStyle}>X</Text>
                                </Pressable>

                                <ScrollView showsVerticalScrollIndicator={false}>

                                    <View style={styles.formatBackground}>
                                        <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Nome: {usuario.name}</Text>
                                        <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Email: {usuario.email}</Text>
                                        <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Instrumento: {usuario.instrumento_id.nome}</Text>
                                        <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Tipo acesso: {usuario.type_access}</Text>
                                        <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 5 }}>Senha: {usuario.password}</Text>

                                        <Text style={{ fontFamily: 'EncodeSans-Light', padding: 10, fontSize: 16, alignSelf: 'center' }}>Permissões:</Text>

                                        <View style={{ paddingVertical: 10 }}>
                                            <View>
                                                <View style={styles.labelContainer}>
                                                    <Text style={{ color: 'black', fontFamily: 'EncodeSans-Light' }}>Cadastros</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light', paddingTop: 5, paddingBottom: 3 }}>Instrumentos: {usuario.check_instrumento == true ? 'Sim' : 'Não'} </Text>
                                                    <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light', paddingBottom: 3 }}>Tablaturas: {usuario.check_tablatura == true ? 'Sim' : 'Não'} </Text>
                                                    <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light', paddingBottom: 3 }}>Usuários: {usuario.check_usuario == true ? 'Sim' : 'Não'} </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ paddingVertical: 10 }}>
                                            <View>
                                                <View style={styles.labelContainer}>
                                                    <Text style={{ color: 'black', fontFamily: 'EncodeSans-Light' }}>Movimentações</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light', paddingTop: 5, paddingBottom: 3 }}>Log atividades: {usuario.check_log == true ? 'Sim' : 'Não'} </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ paddingVertical: 10 }}>
                                            <View>
                                                <View style={styles.labelContainer}>
                                                    <Text style={{ color: 'black', fontFamily: 'EncodeSans-Light' }}>Recursos gerais</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light', paddingTop: 5, paddingBottom: 3 }}>Cadastrar tablatura especial: {usuario.check_tab_especial == true ? 'Sim' : 'Não'} </Text>
                                                    <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light', paddingBottom: 3 }}>Informar ordem de execução: {usuario.check_tab_especial == true ? 'Sim' : 'Não'} </Text>
                                                    <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light', paddingBottom: 3 }}>Informar Bpms: {usuario.check_bpms == true ? 'Sim' : 'Não'} </Text>
                                                    <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light', paddingBottom: 3 }}>Executar Multitracks: {usuario.check_executar_multitracks == true ? 'Sim' : 'Não'} </Text>
                                                </View>
                                            </View>
                                        </View>

                                    </View>

                                </ScrollView>

                            </View>

                        </Modal>
                    </View>) : null}

                { /* NEW / EDIT VIEW */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}>


                    <View style={styles.modalView}>

                        <Pressable
                            style={[styles.buttonFechaModal]}
                            onPress={() => fecharModal()}>
                            <Text style={styles.textStyle}>X</Text>
                        </Pressable>


                        <View style={{ flexDirection: 'row', padding: 10, alignSelf: 'center' }}>
                            <Text style={styles.textMenu}>{tipoView} usuário</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formatBackground}>
                                <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 10 }}>
                                    Para a validação dos dados preencha os campos na cor laranja que são obrigatórios.
                                </Text>
                                <View style={{ paddingVertical: 10 }}>
                                    <View>
                                        <View style={styles.labelContainer}>
                                            <Text style={{ color: validNome, fontFamily: 'EncodeSans-Light' }}>Nome:</Text>
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                fontFamily="EncodeSans-Light"
                                                variant="outlined"
                                                onChangeText={(text) => setNome(text)}
                                                style={styles.input}
                                                value={nome}
                                                placeholder="Informe o nome do usuário"
                                                placeholderTextColor={validNome}
                                                color={validNome}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={{ paddingVertical: 10 }}>
                                    <View>
                                        <View style={styles.labelContainer}>
                                            <Text style={{ color: validEmail, fontFamily: 'EncodeSans-Light' }}>Email:</Text>
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                fontFamily="EncodeSans-Light"
                                                variant="outlined"
                                                onChangeText={(text) => setEmail(text)}
                                                style={styles.input}
                                                value={email}
                                                placeholder="Informe o email do usuário"
                                                placeholderTextColor={validEmail}
                                                color={validEmail}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={{ paddingVertical: 10 }}>
                                    <View>
                                        <View style={styles.labelContainer}>
                                            <Text style={{ color: validPassword, fontFamily: 'EncodeSans-Light' }}>Senha:</Text>
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                fontFamily="EncodeSans-Light"
                                                variant="outlined"
                                                onChangeText={(text) => setPassword(text)}
                                                style={styles.input}
                                                value={password}
                                                placeholder="A senha do usuário"
                                                placeholderTextColor={validPassword}
                                                color={validPassword}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={{ paddingVertical: 10 }}>
                                    <View>
                                        <View style={styles.labelContainer}>
                                            <Text style={{ color: validInstrumento, fontFamily: 'EncodeSans-Light' }}>Instrumento:</Text>
                                        </View>
                                        <View style={styles.inputContainerDropBox}>

                                            <SelectDropdown
                                                data={opcaoInstrumentos}
                                                defaultButtonText={'Selecione:'}
                                                onSelect={(selectedItem, index) => {
                                                    setInstrumento(selectedItem.nome)
                                                    setInstrumentoId(selectedItem.id)
                                                }}
                                                renderButton={(selectedItem, isOpen) => {
                                                    return (
                                                        <View style={styles.dropdownButtonStyle}>
                                                            <Text style={styles.dropdownButtonTxtStyle}>{instrumentoId ? instrumento : 'Selecione:'}</Text>
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
                                            <Text style={{ color: validTypeAccess, fontFamily: 'EncodeSans-Light' }}>Tipo acesso:</Text>
                                        </View>
                                        <View style={styles.inputContainerDropBox}>

                                            <SelectDropdown
                                                data={opcaoTypeAccess}
                                                defaultButtonText={'Selecione:'}
                                                onSelect={(selectedItem, index) => {
                                                    setTypeAccess(selectedItem.nome)
                                                }}
                                                renderButton={(selectedItem, isOpen) => {
                                                    return (
                                                        <View style={styles.dropdownButtonStyle}>
                                                            <Text style={styles.dropdownButtonTxtStyle}>{typeAccess ? typeAccess : 'Selecione:'}</Text>
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
                                            <Text style={{ color: 'grey', fontFamily: 'EncodeSans-Light' }}>Permissões</Text>
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <BouncyCheckbox
                                                isChecked={chkInstrumento}
                                                size={13}
                                                fillColor="#fe9701"
                                                iconStyle={{ borderColor: "white" }}
                                                innerIconStyle={{ borderWidth: 1 }}
                                                style={{ padding: 5 }}
                                                unFillColor="#FFFFFF"
                                                text="Cadastro de Instrumentos"
                                                textStyle={{ fontFamily: "EncodeSans-Light", textDecorationLine: "none", fontSize: 14 }}
                                                onPress={() => setChkInstrumento(!chkInstrumento)}
                                            />

                                            <BouncyCheckbox
                                                isChecked={chkTablatura}
                                                size={13}
                                                fillColor="#fe9701"
                                                iconStyle={{ borderColor: "white" }}
                                                innerIconStyle={{ borderWidth: 1 }}
                                                style={{ padding: 5 }}
                                                unFillColor="#FFFFFF"
                                                text="Cadastro de Tablaturas"
                                                textStyle={{ fontFamily: "EncodeSans-Light", textDecorationLine: "none", fontSize: 14 }}
                                                onPress={() => setChkTablatura(!chkTablatura)}
                                            />

                                            <BouncyCheckbox
                                                isChecked={chkUsuario}
                                                size={13}
                                                fillColor="#fe9701"
                                                iconStyle={{ borderColor: "white" }}
                                                innerIconStyle={{ borderWidth: 1 }}
                                                style={{ padding: 5 }}
                                                unFillColor="#FFFFFF"
                                                text="Cadastro de Usuários"
                                                textStyle={{ fontFamily: "EncodeSans-Light", textDecorationLine: "none", fontSize: 14 }}
                                                onPress={() => setChkUsuario(!chkUsuario)}
                                            />

                                            <BouncyCheckbox
                                                isChecked={chkLog}
                                                size={13}
                                                fillColor="#fe9701"
                                                iconStyle={{ borderColor: "white" }}
                                                innerIconStyle={{ borderWidth: 1 }}
                                                style={{ padding: 5 }}
                                                unFillColor="#FFFFFF"
                                                text="Log de atividades"
                                                textStyle={{ fontFamily: "EncodeSans-Light", textDecorationLine: "none", fontSize: 14 }}
                                                onPress={() => setChkLog(!chkLog)}
                                            />

                                            <BouncyCheckbox
                                                isChecked={chkTabEspecial}
                                                size={13}
                                                fillColor="#fe9701"
                                                iconStyle={{ borderColor: "white" }}
                                                innerIconStyle={{ borderWidth: 1 }}
                                                style={{ padding: 5 }}
                                                unFillColor="#FFFFFF"
                                                text="Cadastrar Tablatura especial"
                                                textStyle={{ fontFamily: "EncodeSans-Light", textDecorationLine: "none", fontSize: 14 }}
                                                onPress={() => setChkTabEspecial(!chkTabEspecial)}
                                            />

                                            <BouncyCheckbox
                                                isChecked={chkBpms}
                                                size={13}
                                                fillColor="#fe9701"
                                                iconStyle={{ borderColor: "white" }}
                                                innerIconStyle={{ borderWidth: 1 }}
                                                style={{ padding: 5 }}
                                                unFillColor="#FFFFFF"
                                                text="Informar BPMs"
                                                textStyle={{ fontFamily: "EncodeSans-Light", textDecorationLine: "none", fontSize: 14 }}
                                                onPress={() => setChkBpms(!chkBpms)}
                                            />

                                            <BouncyCheckbox
                                                isChecked={chkOrdemExibicao}
                                                size={13}
                                                fillColor="#fe9701"
                                                iconStyle={{ borderColor: "white" }}
                                                innerIconStyle={{ borderWidth: 1 }}
                                                style={{ padding: 5 }}
                                                unFillColor="#FFFFFF"
                                                text="Editar ordem execução"
                                                textStyle={{ fontFamily: "EncodeSans-Light", textDecorationLine: "none", fontSize: 14 }}
                                                onPress={() => setChkOrdemExibicao(!chkOrdemExibicao)}
                                            />

                                            <BouncyCheckbox
                                                isChecked={chkMultitrack}
                                                size={13}
                                                fillColor="#fe9701"
                                                iconStyle={{ borderColor: "white" }}
                                                innerIconStyle={{ borderWidth: 1 }}
                                                style={{ padding: 5 }}
                                                unFillColor="#FFFFFF"
                                                text="Cadastrar / Executar Multitracks"
                                                textStyle={{ fontFamily: "EncodeSans-Light", textDecorationLine: "none", fontSize: 14 }}
                                                onPress={() => setChkMultitrack(!chkMultitrack)}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity
                                        onPress={() => handleSubmit({ view: { tipoView }, id: idSelected })}
                                        style={styles.button}>
                                        <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 16, color: 'white', paddingBottom: 5 }}>Salvar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                    </View>

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
        top: 5,
        backgroundColor: '#006059',
        borderRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    textStyle: {
        color: 'white',
        textAlign: 'left',
        paddingHorizontal: 7,
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
    logoPosition: {
        flexDirection: 'row',
        top: '-45%',
        flexWrap: 'wrap',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
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
    }
})

