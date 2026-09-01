import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, Text, TextInput, View } from "react-native";
interface Persona{
  id: number;
  nombre:string;
  apellido:string;
}
async function conectarDB() {
  const db = await SQLite.openDatabaseAsync('ayudantia');
  await db.execAsync(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS persona (id INTEGER PRIMARY KEY NOT NULL,
nombre TEXT NOT NULL, apellido TEXT NOT NULL);
`);
  return db;
}
function useDatabase() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  useEffect(() => {
    const iniciarDb = async () => {
      try {
        const database = await conectarDB();
        setDb(database);
        console.log("Creamos nuestra base de datos :D");
      }
      catch (error) {
        console.error(error)
      }
    };
    iniciarDb();
  }, []);
  const createPersona = async (nombre: string, apellido: string) => {
    if (!db) return;
    try {
      const result = await db.runAsync(
        'INSERT INTO persona (nombre, apellido) VALUES (?,?);',
        nombre,
        apellido
      );
      return result.lastInsertRowId;
    }
    catch (error) {
      console.error(error)
    }
  }
  const getAllPersonas = async():Promise<Persona[]> =>{
    if (!db) return [];
    try{
      const result = await db.getAllAsync<Persona>('SELECT * FROM persona;');
      return result;
    }
    catch (error) {
      console.error(error)
      return [];
    }
  }
  const deletePersona = async (id:number):Promise<boolean>=>{
    if (!db) return false;
    try{
      await db.runAsync('DELETE FROM persona WHERE id = ?;',
         id);
         return true;
    }
    catch (error) {
      console.error(error)
      return false;
    }
  }
  return { db, createPersona, getAllPersonas, deletePersona};
}

export default function Index() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const{
    db, createPersona, getAllPersonas, deletePersona
  } = useDatabase();
  const agregarPersona = async () =>{
    if(!nombre || !apellido){
      Alert.alert("Error", "Completa los campos");
      return;
    }
    const id=await createPersona(nombre, apellido);
    console.log("Persona agregada con id: ", id);
  }
  const mostrarPersonas= async ()=>{
    const resultado = await getAllPersonas();
    setPersonas(resultado);
  }
  const eliminarPersona = async(id:number)=>{
    const success = await deletePersona(id);
    if(success){
      Alert.alert("Exito", "Persona eliminada");
      await mostrarPersonas();
    }
  }
  mostrarPersonas();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Nombre:</Text>
      <TextInput
        placeholder="Ingrese el nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <Text>Apellido:</Text>
      <TextInput
        placeholder="Ingrese el apellido"
        value={apellido}
        onChangeText={setApellido}
      />
      <Button
      title="Guardar Persona"
      onPress={agregarPersona}/>
      <FlatList
        data={personas}
        keyExtractor={(item)=> item.id.toString()}
        renderItem={({item})=>(
          <View>
            <Text>Nombre: {item.nombre}</Text>
            <Text>Apellido: {item.apellido}</Text>
            <Button
            title = "Eliminar Persona"
            onPress={()=> {eliminarPersona(item.id)}}/>
          </View>
        )}  
      />
    </View>
  );
}
