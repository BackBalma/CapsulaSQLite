import { useDatabase } from "@/hooks/useDatabase";
import { useState } from "react";
import { Alert, Button, FlatList, Text, TextInput, View } from "react-native";

interface Producto{
  id: number;
  nombre:string;
  descripcion:string;
  precio:number;
}
export default function Index() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const{
    db,
    createProducto,
    getAllProductos,
    deleteProducto
  } = useDatabase();
  const agregarProducto = async () =>{
    if(!nombre || !descripcion || !precio){
      Alert.alert("Error", "Completa los campos");
      return;
    }
    const precioNum = parseInt(precio);
    if(isNaN(precioNum)){
      Alert.alert("Error", "Completa los campos");
      return;
    }
    const id=await createProducto(nombre, descripcion,precioNum);
    console.log("Producto agregado con id: ", id);
  }
  const mostrarProductos= async ()=>{
    const resultado = await getAllProductos();
    setProductos(resultado);
  }
  const eliminarProductos = async(id:number)=>{
    const success = await deleteProducto(id);
    if(success){
      Alert.alert("Exito", "Producto eliminado");
      await mostrarProductos();
    }
  }
  mostrarProductos();
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
      <Text>Descripción:</Text>
      <TextInput
        placeholder="Ingrese la descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <Text>Precio:</Text>
      <TextInput
        placeholder="Ingrese el precio"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
      />
      <Button
      title="Guardar Producto"
      onPress={agregarProducto}/>
      <FlatList
        data={productos}
        keyExtractor={(item)=> item.id.toString()}
        renderItem={({item})=>(
          <View>
            <Text>Nombre: {item.nombre}</Text>
            <Text>Descripción: {item.descripcion}</Text>
            <Text>Precio: {item.precio}</Text>
            <Button
            title = "Eliminar producto"
            onPress={()=> {eliminarProductos(item.id)}}/>
          </View>
        )}  
      />
    </View>
  );
}
