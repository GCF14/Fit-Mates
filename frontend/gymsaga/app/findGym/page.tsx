'use client';
import Head from 'next/head';
import Map from '../../components/Map/map';
import './style.css';

function FindGymPage() {
  return (
    <div>
      <Head>
        <title>My App</title>
      </Head>

      <div id="map">
        <Map />
      </div>
    </div>
  );
}

export default FindGymPage;
