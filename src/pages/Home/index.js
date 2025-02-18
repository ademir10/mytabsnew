import react, { useState, useEffect } from "react";
import { Platform, PermissionsAndroid, Modal, Pressable, ActivityIndicator, Image, ImageBackground, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";
import { Shadow } from 'react-native-shadow-2';

export default function Home() {
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

    const [perfilAdmin, setPerfilAdmin] = useState();
    const [imageClient, setImageClient] = useState('sem_logo');
    let [isLoading, setIsLoading] = useState(false);
    let [error, setError] = useState();
    let [response, setResponse] = useState();
    const [dadosSession, setDadosSession] = useState([]);
    const [isEnabledChavePix, setIsEnabledChavePix] = useState(false);
    const [isEnabledSuporte, setIsEnabledSuporte] = useState(false);
    const [chavePix, setChavePix] = useState();
    const [valorFatura, setValorFatura] = useState();
    const [ramdom, setRamdom] = useState('?random+\=' + Math.random());
    const [currency, setCurrency] = useState('R$');

    //Carrega o Modal com a chave pix se a licença já estive expirada
    function show_chave_pix() {
        setIsEnabledChavePix(!isEnabledChavePix)
    }

    function show_suporte() {
        setIsEnabledSuporte(!isEnabledSuporte)
    }

    const copyToClipboard = (data) => {
        Clipboard.setString(data.chave);
        Alert.alert('Chave copiada! acesse o aplicativo do banco e formalize o pagamento.');
    };

    const format = amount => {
        return Number(amount)
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,');
    };


    function fecharModal() {
        setIsEnabled(!isEnabled);
        SetResumo(null);
    }


    const spinner = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="orange" />;
        }
        if (error) {
            return <Text>{error}</Text>
        }
    }

    const [userLogged, SetuserLogged] = useState('');
    useEffect(() => {

        fadeIn();
        const fetchUser = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session')
            let resObject = JSON.parse(infoData);
            setDadosSession(resObject);
            //Get user logged profile
            var userName = resObject.userName;
            userName = userName.charAt(0).toUpperCase() + userName.toLowerCase().slice(1)
            SetuserLogged('Olá, ' + userName + '!');
            var perfil_admin = resObject.perfil_admin;
            if (perfil_admin == 'Sim') {
                setPerfilAdmin(true);
            } else {
                setPerfilAdmin(false);
            }

        }
        fetchUser().catch(console.error);
    }, [perfilAdmin],);

    useEffect(() => {
        const getData = async () => {
            var infoData = await AsyncStorage.getItem('@storageMytabs:dados_session')
            let dadosSessao = JSON.parse(infoData);

            var ApiConfig = await AsyncStorage.getItem('@storageMytabs:dados_api');
            var config = JSON.parse(ApiConfig);
            setCurrency('R$');
            setImageClient(config.thumb_caminho_imagem);
            // Agora abre o modal com a chave pix gerada se estiver vencida ou vencendo a licença no dia
            if (dadosSessao.perfil_admin == 'Sim' && dadosSessao.expire_licence == '"hoje"' && dadosSessao.pix_error == 'Sim') {
                Alert.alert('Licença vencendo:', 'A sua licença vence hoje e não conseguimos gerar o seu Pix para pagamento por aqui, verifique se recebeu também sua fatura por email e se precisar de ajuda fale com o nosso suporte.', [{ text: 'OK' },]);
            } else if (dadosSessao.perfil_admin == 'Sim' && dadosSessao.expire_licence == '"hoje"' && dadosSessao.chave_pix_fatura) {
                setChavePix(dadosSessao.chave_pix_fatura);
                setValorFatura(dadosSessao.valor_fatura);
                show_chave_pix();
            }
        }
        getData().catch(console.error);
    }, []);


    return (


        <Animated.View
            style={[
                styles.container,
                animatedStyle,
            ]}>



            <Image
                source={require("../../assets/top2.png")}
                style={styles.topImage}
            />

            <View style={ styles.logoPosition}>
                {imageClient == "sem_logo" ? (
                    <Image
                        style={{ flex: 1, position: 'absolute', width: 100, height: 100, resizeMode: 'contain' }}
                        source={require('../../assets/logo-intro.png')} />
                ) :
                    <Image
                        style={{ flex: 1, position: 'absolute', width: 100, height: 100, resizeMode: 'contain' }}
                        source={{ uri: imageClient + ramdom.replace(/^["'](.+(?=["']$))["']$/, '$1') }}
                    />
                }
            </View>

            <View style={styles.helloContainer}>
                <Text style={styles.message}>{userLogged}</Text>
            </View>

            <View style={styles.containerForm}>
                {spinner()}

                <View style={styles.containerBtn}>
                    <View style={styles.row}>

                        <View style={styles.formatButton2}>


                            <TouchableOpacity onPress={() => navigation.navigate('Instrumentos')}>
                                <Shadow style={styles.shadowBtn} distance={4}>
                                    <Image source={require('../../assets/buttons/btn-instrumentos.png')} style={styles.contentBtn} />
                                    <Text style={styles.txtButton}>Instrumentos</Text>
                                </Shadow>
                            </TouchableOpacity>


                        </View>

                        <View style={styles.formatButton2}>
                            <TouchableOpacity onPress={() => navigation.navigate('Tablaturas')}>
                                <Shadow style={styles.shadowBtn} distance={4}>
                                    <Image source={require('../../assets/buttons/btn-tablaturas.png')} style={styles.contentBtn} />
                                    <Text style={styles.txtButton}>Tablaturas</Text>
                                </Shadow>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formatButton2}>
                            <TouchableOpacity onPress={() => navigation.navigate('Setlist')}>
                                <Shadow style={styles.shadowBtn} distance={4}>
                                    <Image source={require('../../assets/buttons/btn-setlist.png')} style={styles.contentBtn} />
                                    <Text style={styles.txtButton}>Setlist</Text>
                                </Shadow>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formatButton2}>
                            <TouchableOpacity onPress={() => navigation.navigate('Usuarios')}>

                                <Shadow style={styles.shadowBtn} distance={4}>
                                    <Image source={require('../../assets/buttons/btn-usuario.png')} style={styles.contentBtn} />
                                    <Text style={styles.txtButton}>Usuários</Text>
                                </Shadow>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </View>

            <View style={styles.leftImageContainer}>
                <Image
                    source={require("../../assets/footer.png")}
                    style={styles.leftImage}
                />
            </View>

            <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('SignIn')}
                    style={styles.buttonClose}
                    keyboardType='numeric'
                    maxLength={10}>
                    <Text style={{ fontFamily: 'EncodeSans-Light', fontSize: 20, color: 'white' }}>LogOut</Text>
                </TouchableOpacity>
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
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    formatButton2: {
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    shadowBtn: {
        width: 140,
        height: 140,
        borderRadius: 35,
    },
    contentBtn: {
        width: 140,
        height: 140,
    },
    containerBtn: {
        padding: 16,
        top: 170,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    helloContainer: {
        top: 100,
        left: '5%',
    },
    helloText: {
        fontFamily: 'EncodeSans-Light',
        alignSelf: "center",
        fontSize: 25,
        color: "#262626",
    },
    topImage: {
        resizeMode: "stretch",
        width: "100%",
        height: 150,
    },
    message: {
        fontFamily: 'EncodeSans-Light',
        marginTop: -60,
        fontSize: 20,
        color: "black",
    },
    //Aqui fica o conteúdo central da tela
    containerForm: {
        paddingTop: 20,
        flex: 1,
        paddingStart: '5%',
        paddingEnd: '5%',
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
    logoPosition: {
        flexDirection: 'row',
        top: '-5%',
        flexWrap: 'wrap',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    }
})

