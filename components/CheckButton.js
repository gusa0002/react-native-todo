import { StyleSheet,Pressable} from "react-native";
import Fontisto from '@expo/vector-icons/Fontisto';

{/* <Fontisto name="checkbox-active" size={24} color="black" /> */}
{/* <Fontisto name="checkbox-passive" size={24} color="black" /> */}

export default function CheckButton ({updateCompletionState, state, id}) {
    const icon = state ? <Fontisto  name="checkbox-active" size={32} color="green" /> : <Fontisto name="checkbox-passive" size={32} color="#B7B7B7" />;
    return (
        <Pressable  onPress={() => {
            updateCompletionState(id, !state);
        }}>
            {icon}
        </Pressable>
    );
};
