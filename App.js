import { FlatList, StyleSheet, Text, View, Modal, TextInput, Pressable, Image, LogBox} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import FAB from "./components/FAB";
import CheckButton from './components/CheckButton';
import CustomInputView from './components/CustomInputView';
import { useState, useEffect, useRef, use } from 'react';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import MapView from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';

const storageKey = "testAssignmentKey3";
const initialRegion = {
  latitude: 45.424721,
  longitude: -75.695000,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


export default function App() {
  //=================
  // Hooks
  //=================
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("")
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("")
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState("");
  const [sortShowCompleted,setSortShowCompleted] = useState(true);
  const [image, setImage] = useState("");

  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showContent, setShowContent] = useState(false)
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [fullTimeInfo, setFullTimeInfo] = useState({});

  const isFirstRender = useRef(true);
  const [data, setData] = useState([]);
  useEffect(() => {
    async function getDataFromStorage() {
      let data = await getData();
      data = data ? data : [];
      console.log("DATA", data);
      MediaLibrary.requestPermissionsAsync()
      setData(data)
    };
    getDataFromStorage();
    isFirstRender.current = false;
  },[]);
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100); 
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  },[isVisible])


  //=================
  // Functions
  //=================
  function checkInput(){
    let countOfErrors = 0;
    if (title.length < 1) {
      setTitleError("Please add at least 1 character")
      countOfErrors++;
    }
    if (description.length < 5) {
      setDescriptionError("Please add at least 5 character")
      countOfErrors++;
    }
    if (location.length < 3) {
      setLocationError("Please type at least 3 character")
      countOfErrors++;
    }
    if (!fullTimeInfo?.dateSet || !fullTimeInfo?.timeSet) {
      countOfErrors++;
    }
    if (countOfErrors == 0) {
      return true
    }else{
      return false;
    }
  }

  function saveTask() {
    const date = getCurrentDate();
    const taskObject = {title, description, date, location, id:uuidv4(), completed: false, image, selectedLocation, timeStamp: fullTimeInfo.timeStamp};
    setData(currentData => {
      const updatedData = currentData?.length ? [...currentData, taskObject] : [taskObject];
      putData(updatedData);
      return updatedData;
    })
  }

  function getCurrentDate() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    return `${months[month]} ${day}, ${year}`;
  }

  function closeModal() {
    setTitle("");
    setDescription("");
    setLocation("");
    setIsVisible(false);
    setTitleError("");
    setDescriptionError("");
    setLocationError("");
    setImage("");
    setShowTaskDetails(false);
    setSelectedLocation(false);
    setShowTimePicker(false);
    setShowDatePicker(false);
    setSelectedDate("");
    setSelectedTime("");
    setFullTimeInfo({});
  }

  function renderRightActions(id) {
    return(
      <View style={{alignSelf:"center"}}>
        <Pressable onPress={() => {
            deleteTask(id)
          }} style={styles.deleteButton}
        >
          <AntDesign name="delete" size={27} color="red" />
        </Pressable>
      </View>
    )
  }

  function deleteTask(id) {
    const updatedData = data.filter(task => task.id !== id); 
    setData(updatedData);
    putData(updatedData);
  }

  function sortByStatus() {
    setData(currentData => {
      const sortedData = currentData.sort((a, b)=> {
        let number;
        if (a.completed == b.completed) {
          return 0;
        }
        if (sortShowCompleted) {
          return a.completed ? -1 : 1; 
        } else {
          return a.completed ? 1 : -1; 
        }
      });
      setSortShowCompleted(current => !current);
      return sortedData;
    })
  }

  function updateCompletionState(id, newState) {
    setData((currentData) => {
      let updatedData = currentData.map((item) => {
        if (item.id == id) {
          return {title: item.title, description: item.description, location: item.location, date:item.date, id: item.id, completed: newState, image: item.image, selectedLocation: item.selectedLocation, timeStamp: item.timeStamp}
        }
        return item;
      });
      putData(updatedData);
      return updatedData;
    })
  }

  const putData = async (data) => {
    try {
      const stringifiedData = JSON.stringify(data);
      await AsyncStorage.setItem(storageKey, stringifiedData);
    } catch (error) {
      console.log("Error with storing data", error);
    }
  };
  
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(storageKey);
      const value = jsonValue != null ? JSON.parse(jsonValue) : null;
      return value;
    } catch (error) {
      console.log("Error with storing data", error);
    }
  };

  const getDateString = (timeStamp) => {
    const date = new Date(timeStamp);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${months[month]} ${day}, ${year} - ${hours}:${minutes}`
  }

  async function pickupDocument() {
    const document = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
    });
    if (document && document.assets.length) {
      const uri = document.assets[0].uri;
      const name = document.assets[0].name;
      const imageDirectory = FileSystem.documentDirectory;      
      const newUri = `${imageDirectory}${name}`;
      try {
        await FileSystem.copyAsync({
          from: uri,
          to: newUri,
        });
        setImage(newUri);
      } catch (error) {
        setImage(uri);
      }
    }else{
      console.log("The image wasn't selected");
    }
  }

  const onChangeDate = (ev, selectedDate) => {
    if (ev.type === 'dismissed') {
      console.log('Picker was dismissed');
      setShowDatePicker(false);
      return;
    }
    if (ev.type === 'set' && selectedDate) {
      const date = new Date(selectedDate);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      setShowDatePicker(false);
      setFullTimeInfo(current => ({
        ...current,
        year,
        month,
        day,
        dateSet: true
      }));
      console.log("TEST POINt, ", `${months[month]} ${day}, ${year}`);
      
      setSelectedDate(`${months[month]} ${day}, ${year}`);
    }
  };

  const onChangeTime = (ev, selectedTime) => {
    const date = new Date(selectedDate);    
    if (ev.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }
    if (ev.type === "set" && selectedTime) {
      const time = new Date(selectedTime);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      setShowTimePicker(false);
      setFullTimeInfo(current => ({
        ...current,
        hours,
        minutes,
        timeSet: true
      }))
      setSelectedTime(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
    }
  };
  


  //=================
  // View
  //=================
  return (
    <GestureHandlerRootView style={{ flex: 1, marginHorizontal:5 }}>
      
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {data.length == 0 && <View style={{ marginVertical: "auto"}}>
            <Text style={styles.emptyListText}>Your list is empty</Text>
          </View> }
          {data.length > 0 && <View>
            <Pressable style={styles.sortButton} onPress={() => {
                sortByStatus()
              }}>
                <Text style={styles.buttonText}>{sortShowCompleted? "Show Completed First" : "Show Active First"}</Text>
              </Pressable>
            </View>
          }

          {data.length > 0 &&
            <FlatList data={data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({item}) => 
                  <Swipeable rightThreshold={0.8} renderRightActions={() => renderRightActions(item.id)} >
                    <View style={styles.task}>
                      <View>
                        <View style={[styles.taskTextContainer, styles.titleColor]}>
                          <Text style={styles.taskLabel}>Title: </Text>
                          <Text style={styles.taskInfo}>{item.title}</Text>
                        </View>
                        <View style={[styles.taskTextContainer, styles.descriptionColor]}>
                          <Text style={styles.taskLabel}>Description: </Text>
                          <Text style={styles.taskInfo}>{item.description}</Text>
                        </View>
                        <View style={[styles.taskTextContainer, styles.dateColor]}>
                          <Text style={styles.taskLabel}>Date: </Text>
                          <Text style={styles.taskInfo}>{item.date}</Text>
                        </View>
                        <View style={[styles.taskTextContainer, styles.locationColor]}>
                          <Text style={styles.taskLabel}>Location: </Text>
                          <Text style={styles.taskInfo}>{item.location}</Text>
                        </View>
                        <Pressable style={styles.showMoreButton} onPress={() => {
                          setShowTaskDetails(true);
                          setIsVisible(true);
                          setSelectedTask(item);
                          }}>
                          <Text>More info</Text>
                        </Pressable>
                      </View>
                      <View style={{minWidth:"40"}}>
                        <CheckButton state={item.completed} updateCompletionState={updateCompletionState} id={item.id}/>
                      </View>
                    </View>
                  </Swipeable>
              }
            />
          }
          <FAB setIsVisible={setIsVisible}/>
          <Modal
            transparent={true}a
            visible={isVisible}
            onRequestClose={() => setIsVisible(false)}
          >
            <View style={styles.overlay}>
              <View style={styles.modalContent}>
                {/* FAB CLICKED */}
                {!showTaskDetails && <View style={{opacity: showContent? 1 : 0}}>
                  <Text style={styles.modalTitle}>Add a New Task</Text>
                  <CustomInputView placeholder="Title" value={title} setValue={setTitle} error={titleError}/>
                  <CustomInputView placeholder="Description" value={description} setValue={setDescription} error={descriptionError} />
                  <CustomInputView placeholder="Location" value={location} setValue={setLocation} error={locationError} />
                  <View>
                    {image && <Image source={{uri: image}} style={{width: 80, marginHorizontal:"auto",height: 80,borderRadius: 100}} />}
                    <Pressable onPress={pickupDocument}>
                      <Text style={{textAlign:"center", color: image?.length < 1? "red" : "green"}}>Select file</Text>
                    </Pressable>
                  </View>
                  <MapView
                    style={{ flex: 1, maxHeight: 200 }}
                    onRegionChangeComplete={region => {
                      const  {latitude,longitude,latitudeDelta,longitudeDelta} = region;
                      setSelectedLocation({
                        latitude,
                        longitude,
                        latitudeDelta,
                        longitudeDelta
                      });
                    }}
                    initialRegion={initialRegion}
                  />
                  <Pressable onPress={current => setShowDatePicker(true)}>
                      <Text style={{textAlign:"center", color: selectedDate?.length < 1? "red" : "green"}}>{selectedDate.length ? selectedDate : "Select Date"}</Text>
                  </Pressable>
                  {showDatePicker &&
                    <DateTimePicker
                      value={new Date()}
                      mode="date" // can also be 'time' or 'datetime'
                      display="default"
                      onChange={onChangeDate}
                    />
                  }
                  <Pressable onPress={current => setShowTimePicker(true)}>
                      <Text style={{textAlign:"center", color: selectedTime?.length < 1? "red" : "green"}}>{selectedTime.length ? selectedTime : "Select time"}</Text>
                  </Pressable>
                  {showTimePicker &&
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      display="default"
                      onChange={onChangeTime}
                    />
                  }
                  <View style={styles.buttonContainer}>
                    <Pressable style={styles.saveButton} onPress={() => {
                      let isValidData = checkInput();
                      const {year, month, day, hours, minutes} = fullTimeInfo;
                      const timeStamp = new Date(year,month, day, hours, minutes)
                      fullTimeInfo.timeStamp = timeStamp;
                      if (isValidData) {
                        saveTask();
                        closeModal();
                      }
                    }}>
                      <Text style={styles.buttonText}>Save</Text>
                    </Pressable>
                    <Pressable style={styles.cancelButton} onPress={() => {
                      closeModal();
                    }}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </Pressable>
                  </View>
                  {/*  */}
                </View>
                }
                {/* MORE DETAILS CLICKED */}
                {showTaskDetails && <View style={{opacity: showContent? 1 : 0}}>
                  <Text>{selectedTask.id}</Text>
                  {/* TODO: DELETE ? for production */}
                  <Text>{selectedTask?.timeStamp 
                  ? `${getDateString(selectedTask.timeStamp)}`
                  :"No Selected date" }</Text>
                  <Image source={{uri: selectedTask.image}} style={{width: 80, marginHorizontal:"auto",height: 80,borderRadius: 100}}/>
                  <MapView
                    style={{ flex: 1, maxHeight: 200 }}
                    onRegionChangeComplete={region => {
                      const  {latitude,longitude,latitudeDelta,longitudeDelta} = region;
                      setSelectedLocation(initialRegion);
                    }}
                    initialRegion={selectedTask?.selectedLocation ? selectedTask.selectedLocation : initialRegion }
                  />
                  <View style={styles.buttonContainer}>
                    <Pressable style={styles.cancelButton} onPress={() => {
                      closeModal();
                    }}>
                      <Text style={styles.buttonText}>Close</Text>
                    </Pressable>
                  </View>
                </View>}
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

//=================
// Style
//=================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    paddingHorizontal: "10",
    paddingVertical: "15"
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", 
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  buttonContainer: {
    paddingVertical: 15
  },
  saveButton: {
    backgroundColor:  "#26653A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, 
    marginBottom: 5
  },
  cancelButton: {
    backgroundColor: "#B7B7B7",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sortButton: {
    backgroundColor:  "#545454",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: "auto",
    width: "95%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, 
    marginBottom: 15,
    // width: "95"
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  task: {
    flex:1, 
    width: "95%",  
    borderWidth: 2, 
    borderRadius:10, 
    marginHorizontal: "auto", 
    marginBottom: 15, 
    padding: 7, 
    flexDirection:"row",
    alignItems: "center",
    justifyContent:"space-between",
    backgroundColor: "white",
    borderColor: "#B7B7B7"
  },
  emptyListText: {
    textAlign: "center",
    fontSize: 32,
    fontWeight:"600"
  },
  taskTextContainer: {
    marginVertical: 3,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    width:"90%",
    color:"#3A3A3A",
  },
  showMoreButton: {
    marginVertical: 3,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    width:"30%",
    color:"#3A3A3A",
  },
  taskLabel: {
    fontSize:16, 
    color:"#545454", 
    fontWeight: "400",
    maxWidth: "auto"
  },
  taskInfo: {
    fontWeight: "500", 
    fontSize:19,
  },
  titleColor: {
    backgroundColor:"#E7FFEF",
  },
  descriptionColor: {
    backgroundColor: "#EFE8FF"
  },
  dateColor: {
    backgroundColor: "#E8FEFF"
  },
  locationColor: {
    backgroundColor: "#FFF8E8"
  },
});
