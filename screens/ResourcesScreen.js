import React from 'react';
import {
  ScrollView,
  AsyncStorage,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator } from 'react-native';
import { ListItem, SearchBar} from 'react-native-elements';
import theme from '../styles/theme.style.js';
import { ExpoLinksView } from '@expo/samples';
import { createStackNavigator } from 'react-navigation-stack';
import { _getAuthTokenUserId } from '../constants/Helper.js'
import {textStyle} from '../styles/text.style.js';



const width =  Dimensions.get('window').width;
const height =  Dimensions.get('window').height;
var originalFetch = require('isomorphic-fetch');
var fetch = require('fetch-retry')(originalFetch);

export default class ResourcesScreen extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      search:'',
      isLoading: true,
      articleList: [],
    }
  }
  updateSeach = search =>{
    this.setState({search});
  };

  static navigationOptions = ({navigation}) => {
    const {params ={}} = navigation.state;
    let headerTitle = 'Resources';
    let headerTitleStyle = {
      textAlign:'center',
      ...textStyle.header,
      color:"#7B80FF",
    };
    return{headerTitle,headerTitleStyle}

  }
  async componentDidMount(){
    const {authToken, userId} = await _getAuthTokenUserId()
    return fetch('http://192.241.153.104:3000/allAreas/'+userId+'/'+authToken)
      .then((response)=>response.json())
      .then((responseJson) =>{
        this.setState({
          isLoading: false,
          articleList:responseJson
        })
      })
      .catch((error)=>{
        console.log(error)
      });
  }

  render(){
    const {navigation } = this.props;
    const { search } = this.state;
    if (this.state.isLoading){

      return(
        <View style={styles.container}>
          <ActivityIndicator />
        </View>
      )
    } else {
        let articles = (this.state.articleList).map((article,i)=>{
            return <TouchableOpacity
                  key = {i}
                  style = {styles.articleContainer}
                  onPress={()=> this.props.navigation.navigate('Subtopics', {
                    areaId: article['area_id'],
                    area_name: article['area_name'],
                  })
                }>
                    <Text style = {styles.buttonText}>
                        {article.area_name}
                    </Text>
                  </TouchableOpacity>
                });

        return(
          <View style={styles.resourceContainer}>

          <SearchBar
            containerStyle = {styles.searchContainer}
            inputContainerStyle = {{backgroundColor:"#D4D3FF"}}
            inputStyle = {{color:'#FFFFFF', fontSize:14}}
            placeholderTextColor = '#FFFFFF'
            placeholder = "Ask a question or search for a topic..."
            onChangeText={this.updateSeach}
            value = {search}
          />
            {articles}
        </View>
      );
    }
  }
}

ResourcesScreen.navigationOptions = {
  title: 'Resources',
};

const styles = StyleSheet.create({

  container: {
    paddingTop: 15,
    alignItems:'center',
  },

  resourceContainer:{
    justifyContent:'center',
    paddingLeft:width*.075,
  },

  searchContainer:{
    borderRadius:50,
    backgroundColor:"#D4D3FF",
    marginLeft:20,
    marginRight:20,
    height: height * .07,
    width: width*.8,
    justifyContent:'center',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent'
  },
  articleContainer:{
    borderRadius: 15,
    width: width *.85,
    height: height *.15,
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor:'#7B80FF',
  },
  buttonText:{
    textAlign:'center',
    ...textStyle.subheader,
    fontSize:16,
    color:"#FFFFFF",
  },
});
