import react, { useState, useEffect } from "react";
import { SafeAreaView, Modal, ActivityIndicator, Image, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CombinedAnimation from './Combined';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";

export default function SignIn() {
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


    const spinner = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="black" />;
        }
        if (error) {
            return <Text>{error}</Text>
        }
    }

    let [isLoading, setIsLoading] = useState(false);
    let [error, setError] = useState();
    let [response, setResponse] = useState();
    const [fechamentosPendentes, setFechamentosPendentes] = useState();
    const [user, setUser] = useState();
    const [password, SetPassword] = useState();
    const [currency, setCurrency] = useState('R$');
    const [ramdom, setRamdom] = useState('?random+\=' + Math.random());
    const [imageClient, setImageClient] = useState('sem_logo');
    const format = amount => {
        return Number(amount)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,');
    };
    const [isEnabledChavePix, setIsEnabledChavePix] = useState(false);
    const [chavePix, setChavePix] = useState();
    const [valorFatura, setValorFatura] = useState();

    //Carrega o Modal com a chave pix se a licença já estive expirada
    function show_chave_pix() {
        setIsEnabledChavePix(!isEnabledChavePix)
    }

    //copiando a chave pix gerada para o clipboard
    const [copiedText, setCopiedText] = useState('');

    const copyToClipboard = (data) => {
        Clipboard.setString(data.chave);
        Alert.alert('Chave copiada! acesse o aplicativo do banco e formalize o pagamento.');
    };


    //primeiro verifica se o app já foi configurado (tem que usar o useEffect para fzer o getdata)
    useEffect(() => {
        fadeIn();
        const fetchData = async () => {
            var checkConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
            var resObjectConfig = JSON.parse(checkConfig);
            if (checkConfig === null) {
                Alert.alert('Aviso:', 'Notamos que você ainda não configurou o aplicativo, vamos fazer isso agora clicando no botão Configurações.');
                return;
            } else {
                var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session')
                var resObject = JSON.parse(infoData);
                if (infoData) {
                    setUser(resObject.userName);
                    SetPassword(resObject.Password);
                    setImageClient(resObjectConfig.caminho_imagem);
                }
            }
        }
        //é preciso chamar o fecchData fora da função que carrega o AsyncStorage
        fetchData().catch(console.error);
    }, []);


    // e aqui onde fica a action
    async function handleSignIn() {

        var user_name = user;
        //Verifica sempre se já foi confirado o App quando tenta se logar
        var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
        if (ApiConfig) {
            var resObject = JSON.parse(ApiConfig);
            setImageClient(resObject.thumb_caminho_imagem);
        }
        if (ApiConfig === null) {
            Alert.alert('Aviso:', 'Notamos que você ainda não configurou o aplicativo, vamos fazer isso agora clicando no botão Configurações.');
            return;
        }


        var config = JSON.parse(ApiConfig);
        if (config.address_api === null) {
            Alert.alert('Aviso:', 'Notamos que você ainda não configurou o aplicativo, vamos fazer isso agora clicando no botão Configurações.');
            return;
        }

        //Verifica se informou as credenciais
        if (!user || !password) {
            Alert.alert('Aviso', 'Informe as suas credenciais', [{ text: 'OK' },]);
            return;
        }

        //check user credentials
        const timeout = new Promise((resolve, reject) => {
            setTimeout(reject, 5000, 'Request timed out');
        });

        setIsLoading(true);
        var url = config.address_api + '/pages/login_app';
        const request = fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                cardToken: 'G0d1$@Bl3T0d0W4Th3V3Rth1Ng',
                email: user,
                senha: password,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then(
                (result) => {
                    setIsLoading(false);
                    setResponse(result);

                    if (result.retorno_API == 'Gerando faturas') {
                        Alert.alert('Geração de faturas:', 'Desculpe pelo inconveniente, estamos gerando nossas faturas neste momento, retorne novamente mais tarde.', [{ text: 'OK' },]);
                        return;
                    } else if (result.retorno_API == 'Licença expirada, entre em contato conosco para reativa-la.') {
                        Alert.alert('Licença expirada:', 'A sua licença expirou..', [{ text: 'OK' },]);
                        return;
                    } else if (result.retorno_API === 'Usuário ou senha inválidos' || result.retorno_API === 'Falha ao autenticar a conexão.') {
                        Alert.alert('Aviso:', result.retorno_API, [{ text: 'OK' },]);
                    } else if (result.retorno_API === 'Usuário ou senha inválidos') {
                        Alert.alert('Aviso:', result.retorno_API, [{ text: 'OK' },]);
                    } else if (result.status === 400) {
                        return Alert.alert('Ops..', 'Parece que você informou um endereço local para prototipação com um ID de acesso de cliente, verifique os dados.', [{ text: 'OK' },]);
                    } else {


                        // Salva no storage o ID de acesso e o endereço da API
                        const fetchData = async () => {
                            //SAVING MANY DATA AT SAME ASYNC STORAGE KEY
                            let storedObject = {};
                            storedObject.userName = user;
                            storedObject.Password = password;
                            storedObject.perfil_admin = result.perfil_admin;
                            storedObject.usuario = user;
                            storedObject.user_settings = result.user_settings;

                            try {
                                AsyncStorage.setItem('@storageMytabs:dados_session', JSON.stringify(storedObject));
                            } catch (error) {
                                Alert.alert('Atenção', 'Ocorreu um erro ao tentarmos salvar os dados da sessão, avise o suporte.');
                                return;
                            }

                            var data = await AsyncStorage.getItem('@storageMytabs:dados_api');
                            data = JSON.parse(data);
                            if (result.configs[0].avatar) {
                                var address_api = 'http://' + data.address + ':' + data.port;
                                var image_path = data.caminho_imagem;
                                image_path = image_path.replace(/^["'](.+(?=["']$))["']$/, '$1');
                                var caminho_imagem = image_path;
                                var thumb_caminho_imagem = image_path;
                            } else {
                                var caminho_imagem = 'sem_logo';
                                var thumb_caminho_imagem = 'sem_logo';
                            }

                            // injeto os novos caminhos das imagens no storage
                            data.caminho_imagem = caminho_imagem;
                            data.thumb_caminho_imagem = thumb_caminho_imagem;
                            setImageClient(thumb_caminho_imagem);
                            await AsyncStorage.setItem('@storageMytabs:dados_api', JSON.stringify(data));
                            navigation.navigate('Home');
                        }
                        //é preciso chamar o fetchData fora da função que carrega o AsyncStorage
                        fetchData().catch(console.error);
                    }

                }, (error) => {
                    setIsLoading(false);
                    Alert.alert('Aviso:', 'Não conseguimos acessar o datacenter, verifique sua conexão com a internet e se persistir avise o nosso suporte.', [{ text: 'OK' },]);
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
            return;
        }

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
            </View>

            <View style={styles.helloContainer}>
                <Text style={styles.helloText}>MyTabs</Text>

                <SafeAreaView style={{ flex: 1, position: 'absolute', alignSelf: 'center', top: 50 }}>
                    <CombinedAnimation />
                </SafeAreaView>

                <View style={styles.containerHearder}>
                    <Text style={styles.signInText}>Let's Worship!</Text>
                </View>
            </View>





            <View style={styles.containerForm}>

                <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 20, paddingTop: 10, color: 'grey' }}>Usuário:</Text>
                <View style={styles.parent}>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="grey"
                        placeholder="Digite o usuário"
                        onChangeText={setUser}
                        value={user}
                    />
                    <TouchableOpacity
                        style={styles.closeButtonParent}
                        onPress={() => setUser("")}
                    >
                        <Image
                            style={styles.closeButton}
                            source={require("../../assets/close.png")}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 20, paddingTop: 10, color: 'grey' }}>Senha:</Text>
                <View style={styles.parent}>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="grey"
                        placeholder="Digite a senha"
                        onChangeText={SetPassword}
                        value={password}
                        secureTextEntry={true}
                    />
                    <TouchableOpacity
                        style={styles.closeButtonParent}
                        onPress={() => SetPassword("")}
                    >
                        <Image
                            style={styles.closeButton}
                            source={require("../../assets/close.png")}
                        />
                    </TouchableOpacity>
                </View>


                {spinner()}
                <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                    <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 20, color: 'white' }}>Acessar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Config')}
                    style={styles.button}>
                    <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 20, color: 'white' }}>Configurações</Text>
                </TouchableOpacity>
                <Text style={styles.version}>Versão: 1.0.0</Text>
            </View>

            <View style={styles.leftImageContainer}>
                <Image
                    source={require("../../assets/footer.png")}
                    style={styles.leftImage}
                />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    helloContainer: { top: -50 },
    helloText: {
        fontFamily: 'EncodeSans-Light',
        fontSize: 12,
        alignSelf: "center",
        fontSize: 40,
        color: "#262626",
    },
    signInText: {
        fontFamily: 'EncodeSans-Light',
        fontSize: 5,
        alignSelf: "center",
        fontSize: 18,
        color: "#262626",
    },
    topImageContainer: {},

    topImage: {
        resizeMode: "stretch",
        width: "100%",
        height: 150,
    },
    containerHearder: {
        position: 'absolute',
        alignSelf: 'center',
        top: 160
    },
    message: {
        fontFamily: 'Roboto',
        fontSize: 36,
        fontWeight: 'bold',
        color: 'black'
    },
    containerForm: {
        zIndex: 10,
        position: 'absolute',
        top: '35%',
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
    textStyle: {
        color: 'white',
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
})

