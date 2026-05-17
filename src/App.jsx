import { useCallback, useEffect, useMemo, useState } from 'react';
import { captureMapScreenshot, downloadCanvas } from './utils/captureMap.js';
import { motion } from 'framer-motion';
import Login from './components/Login.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import MapViewport from './components/MapViewport.jsx';
import TileModal from './components/TileModal.jsx';
import { I18nProvider, useI18n } from './i18n/I18nContext.jsx';
import { MAP_TILES } from './data/mapTiles.js';
import {
  getCoordinate,
  GRID_SIZE,
  ROLES,
  STORAGE_KEYS,
} from './constants.js';
import {
  loadCurrentServer,
  loadServerState,
  saveCurrentServer,
  saveServerState,
  wipeServerData,
} from './utils/serverStorage.js';

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.loggedIn ? parsed : null;
  } catch {
    return null;
  }
}

function computeAllianceStats(tiles, territories, alliances) {
  const stats = {};
  alliances.forEach((a) => {
    stats[a.id] = {
      id: a.id,
      name: a.name,
      color: a.color,
      tiles: 0,
      coal: 0,
      rareSoil: 0,
    };
  });

  Object.entries(territories).forEach(([indexStr, allianceId]) => {
    const index = Number(indexStr);
    const tile = tiles[index];
    const alliance = stats[Number(allianceId)];
    if (!tile || !alliance) return;
    alliance.tiles += 1;
    alliance.coal += tile.coal;
    alliance.rareSoil += tile.rareSoil;
  });

  return Object.values(stats).filter((s) => s.tiles > 0);
}

function Dashboard() {
  const { t, translateTileType } = useI18n();
  const [auth, setAuth] = useState(() => loadAuth());
  const tiles = useMemo(() => [...MAP_TILES], []);
  const [serverId, setServerId] = useState(() => loadCurrentServer());
  const [serverState, setServerState] = useState(() =>
    loadServerState(loadCurrentServer()),
  );
  const [selectedAllianceId, setSelectedAllianceId] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('paint');
  const [modalIndex, setModalIndex] = useState(null);
  const [structureFilter, setStructureFilter] = useState('');
  const [screenshotBusy, setScreenshotBusy] = useState(false);

  const { territories, alliances, markers } = serverState;

  useEffect(() => {
    if (auth?.loggedIn) {
      localStorage.setItem(
        STORAGE_KEYS.auth,
        JSON.stringify({ ...auth, role: ROLES.ADMIN }),
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.auth);
    }
  }, [auth]);

  useEffect(() => {
    saveServerState(serverId, serverState);
  }, [serverId, serverState]);

  const persistServerState = useCallback((updater) => {
    setServerState((prev) =>
      typeof updater === 'function' ? updater(prev) : updater,
    );
  }, []);

  const handleServerChange = (newServerId) => {
    saveServerState(serverId, serverState);
    saveCurrentServer(newServerId);
    setServerId(newServerId);
    setServerState(loadServerState(newServerId));
    setSelectedAllianceId(null);
    setModalIndex(null);
  };

  const getAllianceById = useCallback(
    (id) => {
      const n = Number(id);
      if (!Number.isFinite(n)) return undefined;
      return alliances.find((a) => Number(a.id) === n);
    },
    [alliances],
  );

  const allianceStats = useMemo(
    () => computeAllianceStats(tiles, territories, alliances),
    [tiles, territories, alliances],
  );

  const handleLogin = (session) => {
    setAuth({ loggedIn: true, role: ROLES.ADMIN, ...session });
  };

  const handleLogout = () => {
    setAuth(null);
    setModalIndex(null);
  };

  const handleTileClick = (index) => {
    if (selectedAllianceId != null) {
      persistServerState((prev) => ({
        ...prev,
        territories: { ...prev.territories, [index]: selectedAllianceId },
      }));
    }
    setModalIndex(index);
  };

  const handleReleaseTerritory = () => {
    if (modalIndex == null) return;
    persistServerState((prev) => {
      const nextTerritories = { ...prev.territories };
      delete nextTerritories[modalIndex];
      return { ...prev, territories: nextTerritories };
    });
    setModalIndex(null);
  };

  const handleSetMarker = (marker) => {
    if (modalIndex == null) return;
    persistServerState((prev) => {
      const nextMarkers = { ...prev.markers };
      if (marker == null) delete nextMarkers[modalIndex];
      else nextMarkers[modalIndex] = marker;
      return { ...prev, markers: nextMarkers };
    });
  };

  const updateAllianceName = (id, name) => {
    persistServerState((prev) => ({
      ...prev,
      alliances: prev.alliances.map((a) =>
        a.id === id ? { ...a, name } : a,
      ),
    }));
  };

  const handleWipeServer = () => {
    if (!window.confirm(t.wipeConfirm)) return;
    wipeServerData(serverId);
    setServerState(loadServerState(serverId));
    setSelectedAllianceId(null);
    setModalIndex(null);
  };

  const handleScreenshot = () => {
    setScreenshotBusy(true);
    try {
      const canvas = captureMapScreenshot({
        tiles,
        territories: { ...territories },
        alliances,
        markers: { ...markers },
        allianceStats,
        serverId,
        getTileLabel: (type) => t.tileTypesExport[type] || translateTileType(type),
        markerLabels: t.markersExport,
        isRtl: t.dir === 'rtl',
        labels: {
          brandTitle: t.loginTitle,
          brandSubtitle: t.loginSubtitle,
          server: t.server,
          exported: t.exportedAt,
          leaderboard: t.leaderboard,
          noStats: t.noTerritories,
          tiles: t.tiles,
          coal: t.coal,
          rareSoil: t.rareSoil,
        },
      });
      downloadCanvas(canvas, `alliance-map-${serverId}-${Date.now()}.png`);
    } catch (err) {
      console.error(err);
      alert(t.screenshotError);
    } finally {
      setScreenshotBusy(false);
    }
  };

  if (!auth?.loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const modalTile = modalIndex != null ? tiles[modalIndex] : null;
  const modalCoord =
    modalIndex != null
      ? getCoordinate(
          Math.floor(modalIndex / GRID_SIZE),
          modalIndex % GRID_SIZE,
        )
      : '';
  const modalAllianceId =
    modalIndex != null ? territories[modalIndex] : null;
  const modalAlliance = modalAllianceId
    ? getAllianceById(modalAllianceId)
    : null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#030712]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-40 bottom-0 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <div className="ui-chrome">
        <Header
          auth={auth}
          serverId={serverId}
          onServerChange={handleServerChange}
          onLogout={handleLogout}
          onScreenshot={handleScreenshot}
          screenshotBusy={screenshotBusy}
        />
      </div>

      <motion.div
        className="relative mx-auto flex w-full max-w-[1920px] flex-1 flex-col gap-3 p-2 sm:gap-4 sm:p-4 lg:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="ui-chrome">
          <Sidebar
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            alliances={alliances}
            selectedAllianceId={selectedAllianceId}
            setSelectedAllianceId={setSelectedAllianceId}
            updateAllianceName={updateAllianceName}
            allianceStats={allianceStats}
            structureFilter={structureFilter}
            setStructureFilter={setStructureFilter}
            onWipeServer={handleWipeServer}
          />
        </div>

        <MapViewport
          tiles={tiles}
          territories={territories}
          markers={markers}
          getAllianceById={getAllianceById}
          onTileClick={handleTileClick}
          modalIndex={modalIndex}
          structureFilter={structureFilter}
          translateTileType={translateTileType}
        />
      </motion.div>

      {modalTile && (
        <TileModal
          tile={modalTile}
          coordinate={modalCoord}
          allianceName={modalAlliance?.name}
          currentMarker={markers[modalIndex]}
          onClose={() => setModalIndex(null)}
          onRelease={handleReleaseTerritory}
          onSetMarker={handleSetMarker}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Dashboard />
    </I18nProvider>
  );
}
