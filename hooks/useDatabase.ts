import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
interface Producto{
  id: number;
  nombre:string;
  descripcion:string;
  precio:number;
}
async function conectarDB() {
  const db = await SQLite.openDatabaseAsync('ayudantia');
  await db.execAsync(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS producto (id INTEGER PRIMARY KEY NOT NULL,
nombre TEXT NOT NULL, descripcion TEXT NOT NULL, precio INTEGER NOT NULL);
`);
  return db;
}
export function useDatabase() {
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
  const createProducto = async (nombre: string, descripcion: string,precio:number) => {
    if (!db) return;
    try {
      const result = await db.runAsync(
        'INSERT INTO producto (nombre, descripcion, precio) VALUES (?,?,?);',
        nombre,
        descripcion,
        precio
      );
      return result.lastInsertRowId;
    }
    catch (error) {
      console.error(error)
    }
  }
  const getAllProductos = async():Promise<Producto[]> =>{
    if (!db) return [];
    try{
      const result = await db.getAllAsync<Producto>('SELECT * FROM producto;');
      return result;
    }
    catch (error) {
      console.error(error)
      return [];
    }
  }
  const deleteProducto = async (id:number):Promise<boolean>=>{
    if (!db) return false;
    try{
      await db.runAsync('DELETE FROM producto WHERE id = ?;',
         id);
         return true;
    }
    catch (error) {
      console.error(error)
      return false;
    }
  }
  return { db,
     createProducto,
     getAllProductos,
      deleteProducto};
}