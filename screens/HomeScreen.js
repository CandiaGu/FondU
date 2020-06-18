import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  AsyncStorage,
} from 'react-native';
import { Icon, Avatar } from 'react-native-elements';
import theme from '../styles/theme.style.js';
import AssessmentScreen from '../screens/AssessmentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { createStackNavigator } from 'react-navigation-stack';
import CustomIcon from '../components/CustomIcon.js';
import { registerRootComponent, AppLoading } from 'expo';
import ContentModule from '../components/ContentModule';
import WeekBar from '../components/WeekBar';
import {textStyle} from '../styles/text.style.js';
import ProgressBar from '../components/ProgressBar';
import { SafeAreaView } from 'react-navigation';
import host from '../constants/Server.js';
import { _getAuthTokenUserId } from '../constants/Helper.js'


const { width } = Dimensions.get('window');
const mainPadding = 40;
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
if (Platform.OS === 'android') {
  SafeAreaView.setStatusBarHeight(0);
}


export default class HomeScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scrollBarValue: new Animated.Value(0),
      assessmentNotif: false, // toggle to determine whether assessment is ready
      initialAssessReady: true,
      initialAssessTaken: false,
      recommendedArea:"",
      recommendedBehaviors:[],

    };
  }



  async componentDidMount(){
    //find initialAssessTaken

    const {authToken, userId} = await _getAuthTokenUserId();


    //Get whether user finished initial assessment
    fetch('http://'+host+':3000/finishedInitial/' + userId + '/' + authToken,{
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({initialAssessTaken:responseJson.finished_initial});
      this.props.navigation.setParams({
        initialAssessTaken: responseJson.finished_initial,
      });
      this.setState({initialAssessReady:true});
    })
    .catch((error) => {
      console.error(error);
    });

    //Get Streak

    fetch('http://' + host +':3000/streak/' + userId + '/' + authToken,{
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.props.navigation.setParams({
        streak: responseJson.streak,
      });
    })
    .catch((error) => {
      console.error(error);
    });

    //Get Recommended Area and Behaviors
    let recArea = 0;
    console.log('http://' + host +':3000/recommendedArea/' + userId + '/' + authToken)
    fetch('http://' + host +':3000/recommendedArea/' + userId + '/' + authToken,{
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        recommendedArea: responseJson.area_name,
      });
      console.log(responseJson.area_id)
      recArea = responseJson.area_id

          console.log('http://' + host +':3000/suggestedBehaviors/' + userId + '/' + authToken + '/' + recArea)
          fetch('http://' + host +':3000/suggestedBehaviors/' + userId + '/' + authToken + '/' + recArea,{
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then((response) => response.json())
          .then((responseJson) => {
            this.setState({
              recommendedBehaviors: responseJson,
            });
          })
          .catch((error) => {
            console.error(error);
          });
    })
    .catch((error) => {
      console.error(error);
    });




  }

  _moveScrollBar = (event) => {
    Animated.timing(this.state.scrollBarValue, {
      toValue: (event.nativeEvent.contentOffset.x*(width-mainPadding*2)/width)/2,
      duration: 0
    }).start();

  };

  async initialAssessComplete(){
    this.setState({initialAssessTaken: true});
    this.props.navigation.setParams({
      initialAssessTaken: true,
    });
    //update in database

    const {authToken, userId} = await _getAuthTokenUserId();

    const data = {
      userId: userId,
      authToken:authToken,
    };

    fetch('http://' + host +':3000/finishInitial/',{
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
  }

  async routineAssessComplete(){
    //TODO
  }

  getInitialAssess() {
    return (
      <TouchableOpacity style = {styles.initialAssessContainer} onPress={() => this.props.navigation.navigate('Assessment',{assessmentType:'initial',assessmentComplete:this.initialAssessComplete.bind(this)})}>
        <Text style= {[textStyle.subheader,{color:'white', opacity: 0.8, marginBottom: 10}]}>Take your first</Text>
        <Text style = {[textStyle.header,{textAlign: 'center', color:'white', marginBottom: 10}]} >Relationship Assessment</Text>
        <TouchableOpacity style = {{flexDirection:'row', alignItems:'center', }}>
          <Icon name='help-outline' color="white"/>
          <Text style= {[textStyle.caption,{color:'white'}]}>What is this?</Text>
        </TouchableOpacity>
        <Icon style = {{marginTop: '20%'}} name='arrow-downward' color="white" size={48}/>
      </TouchableOpacity>
  );
  }

  getHome() {


    return (
      <View style={this.state.assessmentNotif ? styles.notificationBar : styles.noNotificationBar}>


            <View style={styles.welcomeContainer}>
              <Text style = {[{marginLeft: 45, color:theme.TEXT_COLOR, opacity: 0.6, marginBottom: 10 }, textStyle.subheader]}>This week's area  |  {this.state.recommendedArea.toUpperCase()}</Text>
              <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                horizontal= {true}
                decelerationRate={0}
                snapToInterval={width - (width - 300)*2/3}
                snapToAlignment={"center"}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                >

                {
                  Object.keys(this.state.recommendedBehaviors).map((key, index) => ( 
                    <ContentModule title = {this.state.recommendedBehaviors[key].name}
                               key={index}
                               onPress={() => this.props.navigation.navigate('Assessment',{behaviorId:key, assessmentType:'routine',assessmentComplete:this.initialAssessComplete.bind(this)})}
                               behaviorId={key}
                               style = {{}}
                    />
                  ))
                }
                <ContentModule title = 'Review'
                               onPress={() => this.props.navigation.navigate('Assessment',{assessmentType:'review',assessmentComplete:this.initialAssessComplete.bind(this)})}
                               style = {{}}
                />

              </ScrollView>
            </View>
          </View>
    );

  }

  render() {
    return this.state.initialAssessReady ? (this.state.initialAssessTaken ? this.getHome() : this.getInitialAssess()):null ;
  }


  static navigationOptions = ({ navigation }) => {

    return {
      headerTitle: 'fondu',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTransparent: !navigation.getParam('initialAssessTaken'),
      headerLayoutPreset: 'center',
      headerTitleStyle: {textAlign:"center",
                         flex:1,
                         color: navigation.getParam('initialAssessTaken') ? theme.TEXT_COLOR : '#FFFFFF',
                         fontWeight: 'bold'},
      headerLeft: (
                    <TouchableOpacity style={{marginLeft: 25, borderRadius: 50}}
                                      onPress={()=> navigation.navigate('Profile')}>
                                      <Avatar rounded size = "small" icon={{name: 'person'}}/>
                    </TouchableOpacity>
                  ),
      headerTitleContainerStyle: {
        left: 0,
        right:0,
      },
      headerRight: ( navigation.getParam('initialAssessTaken') ? <View style={{marginRight: 25, flexDirection: 'row'}}>
                      <Image source={require('../assets/images/streak/streak-fire.png')} style={{height: 30, width: 30}}/>
                      <Text style={[{marginLeft:5, color:theme.TEXT_COLOR, alignSelf:'center', opacity: 0.5}, textStyle.subheader]}>{navigation.getParam('streak')}</Text>
                      <Text style={[{marginLeft:7, color:theme.TEXT_COLOR, alignSelf:'center', opacity: 0.5}, textStyle.subheader]}>lv ?</Text>
                      </View>: null
                    )
    }
  };

}




const AppNavigator = createStackNavigator({
  Home:  HomeScreen,
  Assessment: AssessmentScreen,
  Profile: ProfileScreen,
});

const styles = StyleSheet.create({
  notificationBar:{
    backgroundColor: theme.PRIMARY_COLOR_4,
    flex: 1,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  noNotificationBar:{
    flex: 1,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  notificationText:{
    padding: mainPadding,
    color: theme.TERTIARY_COLOR,
    fontWeight: 'bold',
    textAlign:'center',
  },
  textContainer: {
    color: theme.PRIMARY_COLOR,
  },
  container: {
    flex: 1,

  },
  contentContainer: {
    paddingTop: 5,
    paddingLeft: (width - 300)/3,
    paddingRight: (width - 300)/3,


  },
  welcomeContainer: {
    marginTop: 10,
    flex:1,
    width: width,
  },
  mainHeaderText:{
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.TERTIARY_COLOR,
  },
  mainParagraphText:{
    fontSize: 15,
    color: theme.TERTIARY_COLOR,
  },
  mainImageContainer:{
    width: width/3,
    height:width/3,
    backgroundColor: '#F2F2F2',
    margin: 30,
  },
  initialAssessContainer:{
    backgroundColor: theme.PRIMARY_COLOR_4,
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  initialAssessText:{
    color: 'white'
  }

});
