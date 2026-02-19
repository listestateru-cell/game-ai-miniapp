import PropTypes from "prop-types";
import { useCallback, useState } from "react";
import BattleMenu from "./BattleMenu";
import BattleRoom from "./BattleRoom";
import BattleStakeModal from "./BattleStakeModal";

export default function BattlePage({ user }) {
  const [step, setStep] = useState("menu"); // "menu" | "room"
  const [battleType, setBattleType] = useState(null);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [room, setRoom] = useState(null);

  const resetToMenu = useCallback(() => {
    setRoom(null);
    setStep("menu");
    setBattleType(null);
    setShowStakeModal(false);
  }, []);

  const handleJoinedRoom = useCallback(
    (joinedRoom) => {
      if (joinedRoom && typeof joinedRoom === "object" && joinedRoom.id) {
        setRoom(joinedRoom);
        setStep("room");
      } else {
        console.warn("handleJoinedRoom: invalid room received", joinedRoom);
        resetToMenu();
      }
    },
    [resetToMenu]
  );

  const handleSelectType = useCallback((typeKey) => {
    if (!typeKey) return;
    setBattleType(typeKey);
    setShowStakeModal(true);
  }, []);

  const handleStakeModalSelect = useCallback(
    (roomObj) => {
      if (roomObj && typeof roomObj === "object" && roomObj.id) {
        setRoom(roomObj);
        setStep("room");
      } else {
        resetToMenu();
      }
      setShowStakeModal(false);
      setBattleType(null);
    },
    [resetToMenu]
  );

  if (!user || !user.id) {
    return <div>Авторизуйтесь для участия в битве.</div>;
  }

  return (
    <>
      {step === "menu" && (
        <>
          <BattleMenu
            onSelectType={handleSelectType}
            user={user}
            onJoinedRoom={handleJoinedRoom}
          />
          {showStakeModal && battleType && (
            <BattleStakeModal
              open={showStakeModal}
              onSelect={handleStakeModalSelect}
              onClose={() => {
                setShowStakeModal(false);
                setBattleType(null);
              }}
              user={user}
              battleType={battleType}
            />
          )}
        </>
      )}

      {step === "room" && room && room.id && (
        // ВАЖНО: BattleRoom ожидает onLeave — передаём resetToMenu как onLeave
        <BattleRoom room={room} userId={user.id} onLeave={resetToMenu} />
      )}
    </>
  );
}

BattlePage.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
  }),
};