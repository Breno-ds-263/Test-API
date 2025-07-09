import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Mapa() {
  
  const recifeRegion = {
    latitude: -8.061794,
    longitude: -34.880948,
    latitudeDelta: 0.0922, 
    longitudeDelta: 0.0421, 
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={recifeRegion} 
        showsUserLocation={true} 
        showsMyLocationButton={true} 
      >
        <Marker
          coordinate={{ latitude: -8.061794, longitude: -34.880948 }}
          title={"Recife"}
          description={"A Veneza Brasileira"}
        />
      </MapView>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Seu mapa de Recife está pronto!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '80%', 
  },
  infoBox: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});