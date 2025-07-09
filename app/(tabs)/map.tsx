import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const ORS_API_KEY = "5b3ce3597851110001cf6248c8670cf2d86e476e9b89dd626a67deb6";

const origem = { latitude: -8.063149, longitude: -34.871139 };
const destino = { latitude: -8.047562, longitude: -34.877003 };

interface Coordenada {
  latitude: number;
  longitude: number;
}

interface Passo {
  instruction: string;
  distance: number;
  duration: number;
}

export default function App() {
  const [rota, setRota] = useState<Coordenada[]>([]);
  const [instrucoes, setInstrucoes] = useState<Passo[]>([]);

  useEffect(() => {
    const buscarRota = async () => {
      try {
        const response = await axios.post(
          "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
          {
            coordinates: [
              [origem.longitude, origem.latitude],
              [destino.longitude, destino.latitude],
            ],
            language: "pt", // <-- Aqui: pede instruções em português
          },
          {
            headers: {
              Authorization: ORS_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        const dados = response.data;

        const coordenadas = dados.features[0].geometry.coordinates.map(
          ([longitude, latitude]: [number, number]) => ({
            latitude,
            longitude,
          })
        );

        const steps: Passo[] =
          dados.features[0].properties.segments[0].steps.map((step: any) => ({
            instruction: step.instruction,
            distance: step.distance,
            duration: step.duration,
          }));

        setRota(coordenadas);
        setInstrucoes(steps);
      } catch (error) {
        console.error("Erro ao buscar rota:", error);
        Alert.alert("Erro", "Não foi possível buscar a rota.");
      }
    };

    buscarRota();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: origem.latitude,
          longitude: origem.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={origem} title="Origem" />
        <Marker coordinate={destino} title="Destino" />
        {rota.length > 0 && (
          <Polyline coordinates={rota} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instruções:</Text>
        <FlatList
          data={instrucoes}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.instructionText}>
              • {item.instruction} ({item.distance.toFixed(0)} m, {Math.round(item.duration)} s)
            </Text>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.6,
  },
  instructionsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  instructionsTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 4,
  },
});
