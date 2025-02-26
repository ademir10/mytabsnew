import react, { useState, useEffect } from "react";
import { Platform, Pressable, ActivityIndicator, Image, ImageBackground, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";

export default function Config() {
    const navigation = useNavigation();
    //variavel que guarda se o campo endereço do datacenter esta visivel
    const [elementVisible, setElementVisible] = useState(false);


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


    let [isLoading, setIsLoading] = useState(false);
    let [error, setError] = useState();
    let [response, setResponse] = useState();
    const [showDispositivos, setShowDispositivos] = useState();
    const [porta, setPorta] = useState();
    const [endereco, setEndereco] = useState();
    const [ramdom, setRamdom] = useState('?random+\=' + Math.random());
    const [imageClient, setImageClient] = useState('sem_logo');

    function handlePress() {
        setElementVisible(true);
    }

    const spinner = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="black" />;
        }
        if (error) {
            return <Text>{error}</Text>
        }
    }

    //loading address and port configurated
    useEffect(() => {
        const fetchData = async () => {
            fadeIn();
            var data = await AsyncStorage.getItem('@storageMytabs:dados_api');
            const json = data;
            const obj = JSON.parse(json);
            if (data) {
                setImageClient(obj.thumb_caminho_imagem);
            }
            if (obj != null) {
                setEndereco(obj.address);
                setPorta(obj.port);
            }
        }
        //é preciso chamar o fecchData fora da função que carrega o AsyncStorage
        fetchData().catch(console.error);
    }, []);


    // e aqui onde fica a action
    async function save_config() {
        //Verifica se informou o id de acesso
        if (!porta) {
            Alert.alert('Atenção', 'Informe o ID da empresa', [{ text: 'OK' },]);
            return;
        }

        setIsLoading(true);
        //Agora remove todos os espaços em branco depois do id acesso informado
        var checkedvalue = porta.trim();
        var port = checkedvalue;

        var str = porta.charAt(0);
        if (endereco) {
            var addr = endereco.charAt(0);
        }
        //HEROKU
        if (str == 'd' || str == 'D') {
            var hospedagem = 'heroku';
            //SERVIDOR DE TESTES
        } else if (port == '1340') {
            var hospedagem = 'ddti';
            var address = 'dsoft.ddns.net';
            //CL9
        } else if (port != '1340' && addr != '1' || port != '1337' && addr == '1') {
            var hospedagem = 'linux';
            var address = 'getapp.ddns.net';
            //ACESSO LOCAL
        } else if (port == '1337' && addr == '1') {

            var hospedagem = 'ddti';
            var address = endereco;
        }
        if (hospedagem == 'ddti' && address === null) {
            setIsLoading(false);
            return Alert.alert('Informe o endereço do servidor!', 'Precisamos desta informação.', [{ text: 'OK' },]);
        } else if (hospedagem == 'ddti' && address == '') {
            setIsLoading(false);
            return Alert.alert('Informe o endereço do servidor!', 'Precisamos desta informação.', [{ text: 'OK' },]);
        } else if (hospedagem == 'ddti' && port == '') {
            setIsLoading(false);
            return Alert.alert('Atenção:', 'Informe o ID DE ACESSO! Campo obrigatório.', [{ text: 'OK' },]);
        } else if (hospedagem == 'ddti' && port === null) {
            setIsLoading(false);
            return Alert.alert('Atenção:', 'Informe o Número da porta! Campo obrigatório.', [{ text: 'OK' },]);
        } else if (hospedagem == 'heroku' && port === null) {
            setIsLoading(false);
            return Alert.alert('Atenção:', 'Informe o ID DE ACESSO! Campo obrigatório.', [{ text: 'OK' },]);
        } else if (hospedagem == 'heroku' && port === '') {
            setIsLoading(false);
            return Alert.alert('Atenção:', 'Informe o ID DE ACESSO! Campo obrigatório.', [{ text: 'OK' },]);
        } else if (hospedagem == 'linux' && port === null) {
            setIsLoading(false);
            return Alert.alert('Atenção:', 'Informe o ID DE ACESSO! Campo obrigatório.', [{ text: 'OK' },]);
        } else if (hospedagem == 'linux' && port === '') {
            setIsLoading(false);
            return Alert.alert('Atenção:', 'Informe o ID DE ACESSO! Campo obrigatório.', [{ text: 'OK' },]);
        } else {

            //ESTANDO TUDO OK NAS VALIDAÇÕES É FEITA A CONEXÃO COM A API
            //conectando com a API externa
            const timeout = new Promise((resolve, reject) => {
                setTimeout(reject, 5000, 'Request timed out');
            });

            let dados_app = JSON.stringify({
                cardToken: 'G0d1$@Bl3T0d0W4Th3V3Rth1Ng',
                type_access: 'check_config'
            });

            var url = 'http://' + address + ':' + port + `/pages/config_app/?dados_app=${dados_app}`;
            const request = fetch(url, {
                method: 'GET',
                headers: { 'Content-type': 'application/json; charset=UTF-8' },
            })
                .then((response) => response.json())
                .then(
                    (result) => {
                        setIsLoading(false);
                        setResponse(result);

                        if (result.retorno_API == 'Desculpe este cliente não possui contratação de acesso via aplicativo.') {
                            Alert.alert('Ops..', 'Entre em contato com o seu suporte.', [{ text: 'OK' },]);
                            return
                        } else {

                            if (result.logo == '' || Object.is(result.logo, null)) {
                                var caminho_imagem = 'sem_logo';
                            } else {
                                var caminho_imagem = 'http://' + address + ':' + port + '/images/uploads/' + result.logo;
                            }

                            //Guardando varias informações dentro de um mesmo registro
                            const newData = {
                                address: address,
                                port: port,
                                caminho_imagem: caminho_imagem,
                                address_api: 'http://' + address + ':' + port
                            }

                            setImageClient(caminho_imagem);

                            // Salva no storage o ID de acesso e o endereço da API
                            const fetchData = async () => {
                                await AsyncStorage.setItem('@storageMytabs:dados_api', JSON.stringify(newData));
                            }
                            //é preciso chamar o fechData fora da função que carrega o AsyncStorage
                            fetchData().catch(console.error);
                            navigation.navigate('SignIn');
                            Alert.alert(result.retorno_API.razao, 'Bem vindo! seu aplicativo já está configurado, informe as suas credênciais e clique no botão ACESSAR.', [{ text: 'OK' },]);
                        }

                    }, (error) => {
                        setIsLoading(false);
                        Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique sua conexão com a internet e se persistir avise o nosso suporte: ' + error, [{ text: 'OK', onPress: () => console.log(error) },]);
                    }
                )
            try {
                const response = await Promise
                    .race([timeout, request]);
                return true;
            }
            catch (error) {
                setIsLoading(false);
                Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique a sua conexão com a internet e se os dados informados estão corretos: ' + error, [{ text: 'OK' },]);
            }
        }
    }



    return (

        <Animated.View
            style={[
                styles.container,
                animatedStyle,
            ]}>
            <Image
                source={require("../../assets/top.png")}
                style={styles.topImage}
            />

            <View style={styles.helloContainer}>
                <Pressable onPress={handlePress}>
                    <Text style={styles.helloText}>Configurações</Text>
                </Pressable>
            </View>

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

            <View style={styles.containerHearder}>
                <Text style={styles.message}>Se este é o seu primeiro acesso e você não possui os dados abaixo para a configuração, entre em contato conosco através dos nossos canais de atendimento.</Text>
            </View>

            <View style={styles.containerForm}>
                {spinner()}

                {elementVisible ? (<View style={styles.parent}>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor='#808080'
                        placeholder="Endereço do datacenter:"
                        onChangeText={setEndereco}
                        value={endereco}
                    />
                    <TouchableOpacity
                        style={styles.closeButtonParent}
                        onPress={() => setEndereco("")}
                    >
                        <Image
                            style={styles.closeButton}
                            source={require("../../assets/close.png")}
                        />
                    </TouchableOpacity>
                </View>) : null}

                <View style={styles.parent}>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor='#808080'
                        placeholder="ID Empresa:"
                        onChangeText={setPorta}
                        value={porta}
                    />
                    <TouchableOpacity
                        style={styles.closeButtonParent}
                        onPress={() => setPorta("")}
                    >
                        <Image
                            style={styles.closeButton}
                            source={require("../../assets/close.png")}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={save_config}>
                    <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 20, color: 'white' }}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('SignIn')}
                    style={styles.button}
                    keyboardType='numeric'
                    maxLength={10}>
                    <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 20, color: 'white' }}>Voltar</Text>
                </TouchableOpacity>
            </View>


            <View style={styles.leftImageContainer}>
                <Image
                    source={require("../../assets/footer2.png")}
                    style={styles.leftImage}
                />
            </View>
        </Animated.View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    helloContainer: { top: - 30 },
    helloText: {
        fontFamily: 'EncodeSans-Light',
        alignSelf: "center",
        fontSize: 25,
        color: "#262626",
    },
    signInText: {
        fontFamily: 'EncodeSans-Light',
        top: 5,
        left: '33%',
        fontSize: 18,
        color: "#262626"
    },
    topImageContainer: {},
    topImage: {
        resizeMode: "stretch",
        width: "100%",
        height: 150,
    },
    containerHearder: {
        marginTop: '10%',
        marginBottom: '8%',
        paddingStart: '5%'
    },
    message: {
        fontFamily: 'EncodeSans-Light',
        fontSize: 17,
        marginTop: -60,
        color: 'grey',
        textAlign: 'justify',
        paddingRight: 20
    },
    containerForm: {
        zIndex: 10,
        position: 'absolute',
        top: '45%',
        flex: 1,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        paddingStart: '5%',
        paddingEnd: '5%',
        //shadowOpacity: 0.75,
        shadowRadius: 5,
        shadowColor: 'black',
        shadowOffset: { height: 0, width: 0 },
    },
    title: {
        fontSize: 20,
        marginTop: 28,
    },
    input: {
        width: '100%',
        borderBottomWidth: 1,
        height: 45,
        marginBottom: 12,
        fontFamily: 'EncodeSans-Light',
        fontSize: 20,
        paddingTop: 10,
        borderColor: '#cdcdcd',
        color: 'grey'
    },
    button: {
        backgroundColor: '#006059',
        width: '100%',
        borderRadius: 4,
        paddingVertical: 10,
        marginTop: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold'
    },
    buttonConfig: {
        marginTop: 14
    },
    version: {
        fontFamily: 'EncodeSans-Light',
        fontSize: 12,
        color: 'black',
        textAlign: 'right',
        right: 2,
    },
    parent: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    textInput: {
        width: "100%",
    },
    closeButton: {
        height: 16,
        width: 16,
        marginLeft: -20
    },
    closeButtonParent: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 5,
    },
    centeredView2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    textStyle: {
        color: 'white',
    },
    buttonChavePix: {
        marginTop: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'orange',
        borderRadius: 6,
        paddingVertical: 4,
        marginHorizontal: 2
    },
    textStyleChavePix: {
        color: 'white',
        textAlign: 'left',
        paddingHorizontal: 7,
        fontWeight: '400',
    },
    leftImage: {
        width: "100%",
        height: "70%",
        position: 'fixed',
        bottom: 0,
        top: '50%',
        left: 0,
        right: 0,
        zIndex: -1,
        resizeMode: "stretch",
    },
    logoPosition: {
        flexDirection: 'row',
        top: '-10%',
        flexWrap: 'wrap',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
