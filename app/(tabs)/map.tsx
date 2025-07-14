import axios from "axios";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const ORS_API_KEY = "5b3ce3597851110001cf6248c8670cf2d86e476e9b89dd626a67deb6";

interface Coordenada {
  latitude: number;
  longitude: number;
}

interface Passo {
  instruction: string;
  distance: number;
  duration: number;
}

interface Ponto {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

export default function App() {
  const [origem, setOrigem] = useState<Coordenada | null>(null);
  const [rota, setRota] = useState<Coordenada[]>([]);
  const [instrucoes, setInstrucoes] = useState<Passo[]>([]);
  const [destino, setDestino] = useState<Coordenada | null>(null);
  const [pontoMaisProximo, setPontoMaisProximo] = useState<Ponto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [region, setRegion] = useState<any>(null);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const pegarLocalizacaoECalcularRota = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permissão negada", "Não foi possível acessar a localização.");
          setCarregando(false);
          return;
        }

        const local = await Location.getCurrentPositionAsync({});
        const origemAtual = {
          latitude: local.coords.latitude,
          longitude: local.coords.longitude,
        };

        setOrigem(origemAtual);

        setRegion({
          latitude: origemAtual.latitude,
          longitude: origemAtual.longitude,
          latitudeDelta: 0.01, // começa com zoom mais próximo
          longitudeDelta: 0.01,
        });

        calcularRota(origemAtual);
      } catch (error) {
        console.error("Erro ao obter localização:", error);
        Alert.alert("Erro", "Não foi possível obter a localização.");
      }
    };

    pegarLocalizacaoECalcularRota();
  }, []);

  const calcularRota = async (origemEscolhida: Coordenada) => {
    try {
      setRota([]);
      setInstrucoes([]);
      setDestino(null);
      setPontoMaisProximo(null);

      const pontosResp = await axios.get<Ponto[]>(
        "https://labgeo3.recife.ifpe.edu.br/SynesthesiaAPI/points"
      );
      const pontos = pontosResp.data;

      if (pontos.length === 0) {
        Alert.alert("Nenhum ponto encontrado.");
        setCarregando(false);
        return;
      }

      const calcularDistancia = (a: Coordenada, b: Coordenada) => {
        const R = 6371e3;
        const rad = (x: number) => (x * Math.PI) / 180;
        const dLat = rad(b.latitude - a.latitude);
        const dLon = rad(b.longitude - a.longitude);
        const lat1 = rad(a.latitude);
        const lat2 = rad(b.latitude);

        const a_ =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a_), Math.sqrt(1 - a_));
        return R * c;
      };

      let maisProximo = pontos[0];
      let menorDistancia = calcularDistancia(origemEscolhida, maisProximo);

      for (const ponto of pontos) {
        const d = calcularDistancia(origemEscolhida, ponto);
        if (d < menorDistancia) {
          maisProximo = ponto;
          menorDistancia = d;
        }
      }

      setDestino({ latitude: maisProximo.latitude, longitude: maisProximo.longitude });
      setPontoMaisProximo(maisProximo);

      const rotaResp = await axios.post(
        "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
        {
          coordinates: [
            [origemEscolhida.longitude, origemEscolhida.latitude],
            [maisProximo.longitude, maisProximo.latitude],
          ],
          language: "pt",
        },
        {
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const dados = rotaResp.data;

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

      setCarregando(false);
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
      Alert.alert("Erro", "Não foi possível calcular a rota.");
      setCarregando(false);
    }
  };

  const aumentarZoom = () => {
    if (!region) return;
    setRegion({
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    });
  };

  const diminuirZoom = () => {
    if (!region) return;
    setRegion({
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    });
  };

  if (carregando || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando localização e rota...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
      >
        {origem && <Marker coordinate={origem} title="Você está aqui" />}
        {destino && (
          <Marker
            coordinate={destino}
            pinColor="green"
            title={pontoMaisProximo?.name || "Destino"}
          />
        )}
        {rota.length > 0 && (
          <Polyline coordinates={rota} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>

      <View style={styles.zoomButtons}>
        <TouchableOpacity onPress={aumentarZoom} style={styles.zoomButton}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={diminuirZoom} style={styles.zoomButton}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          {pontoMaisProximo
            ? `Rota até: ${pontoMaisProximo.name}`
            : "Carregando rota..."}
        </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  zoomButtons: {
    position: "absolute",
    right: 10,
    top: 10,
    flexDirection: "column",
  },
  zoomButton: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 10,
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  zoomText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
