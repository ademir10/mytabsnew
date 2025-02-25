import react, { useState, useEffect } from "react";
import { Dimensions, FlatList, Modal, Pressable, ActivityIndicator, Image, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Button } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";
import filter from 'lodash.filter';
const _ = require('lodash');

export default function Instrumentos() {
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
    const [instrumentos, setInstrumentos] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [nome, setNome] = useState();
    const [validNome, setValidNome] = useState('grey');
    const [tipoView, setTipoView] = useState();
    const [idSelected, setIdSelected] = useState();
    const [fullData, setFullData] = useState([]);

    //code used to searchBar
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = (query) => {
        setSearchQuery(query);
        const formattedQuery = query.toLowerCase();

        const filteredData = filter(fullData, (data) => {
            return contains(data, formattedQuery);
        });
        setInstrumentos(filteredData);

    }

    const contains = ({ nome }, query) => {
        if (
            nome.toLowerCase().includes(query)
        ) {
            return true;
        }
        return false;
    }

    function fecharModal(dados) {
        if (dados) {
            setIdSelected(dados.id);
            setNome(dados.nome);
            setTipoView('Editar');
        } else {
            setNome('');
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
    }, [nome]);

    useEffect(() => {
        fadeIn();
        const getData = async () => {
            var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session')
            let dadosSessao = JSON.parse(infoData);

            var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
            var config = JSON.parse(ApiConfig);
            setImageClient(config.thumb_caminho_imagem);

            //Buscando instrumentos cadastrados
            const timeout = new Promise((resolve, reject) => {
                setTimeout(reject, 5000, 'Request timed out');
            });
            var url = config.address_api + '/pages/index_instrumentos';
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
                        setFullData(result.instrumentos);

                        setInstrumentos(result.instrumentos);

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
        if (validNome === '#ff7401' && data.tipo_view != 'Excluir') {
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
                                    nome: nome,
                                    usuario_logado: dadosSessao.usuario,
                                    tipo_view: tipoView
                                })
                            }

                            var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
                            var config = JSON.parse(ApiConfig);

                            const timeout = new Promise((resolve, reject) => {
                                setTimeout(reject, 5000, 'Request timed out');
                            });
                            var url = config.address_api + '/pages/crud_instrumentos';
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
                                        } else if (retorno_API.erro == 'relationship') {
                                            setNome('');
                                            Alert.alert('Aviso:', retorno_API.mensagem, [{ text: 'OK', onPress: () => null },]);
                                        } else {
                                            setInstrumentos(retorno_API.list_updated);
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

            <View>
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
                            <Text style={styles.textMenu}>Cadastro de Instrumentos</Text>
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

                        {instrumentos.length > 0 ? (
                            <View style={styles.formatBackground}>

                                <View style={{ paddingBottom: 160 }}>
                                    <FlatList nestedScrollEnabled
                                        data={instrumentos}
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
                                                            <TouchableOpacity><Text style={{ color: 'black', fontFamily: 'EncodeSans-Light', fontSize: 16 }}>{item.nome}</Text></TouchableOpacity>
                                                        </View>
                                                        <View style={{ position: 'absolute', right: '10%', alignSelf: 'center' }}>
                                                            <TouchableOpacity
                                                                onPress={() => fecharModal({ id: item.id, nome: item.nome })}
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

                { /* NEW VIEW */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}>

                    <View style={styles.modalView}>

                        <View style={{ flexDirection: 'row', padding: 10, alignSelf: 'center' }}>
                            <Text style={styles.textMenu}>{tipoView} instrumento</Text>
                        </View>
                        <View style={styles.formatBackground}>
                            <Text style={{ fontFamily: 'EncodeSans-Light', paddingBottom: 10 }}>
                                Para a validação dos dados preencha os campos na cor laranja que são obrigatórios.
                            </Text>
                            <View style={{ paddingVertical: 10 }}>
                                <View>
                                    <View style={styles.labelContainer}>
                                        <Text style={{ color: validNome, fontFamily: 'EncodeSans-Light' }}>Descrição:</Text>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            fontFamily="EncodeSans-Light"
                                            variant="outlined"
                                            onChangeText={(text) => setNome(text)}
                                            style={styles.input}
                                            value={nome}
                                            placeholder="Exemplo: Bateria, Guitarra, etc.."
                                            placeholderTextColor={validNome}
                                            color={validNome}
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

                        <Pressable
                            style={[styles.buttonFechaModal]}
                            onPress={() => fecharModal()}>
                            <Text style={styles.textStyle}>X</Text>
                        </Pressable>
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

