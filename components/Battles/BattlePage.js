import { useState } from "react";
import BattleMenu from "../Battles/BattleMenu";
import BattleRoom from "../Battles/BattleRoom";
import BattleStakeModal from "../Battles/BattleStakeModal";

export default function BattlePage({ user }) {
  const [step, setStep] = useState("menu"); // menu | room
  const [battleType, setBattleType] = useState(null);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [room, setRoom] = useState(null);

  // Обновление при присоединении к комнате
  function handleJoinedRoom(joinedRoom) {
    if (joinedRoom && typeof joinedRoom === "object" && joinedRoom.id) {
      setRoom(joinedRoom);
      setStep("room");
    } else {
      setRoom(null);
      setStep("menu");
    }
  }

  // Открытие модалки выбора ставки
  function handleSelectType(typeKey) {
    if (!typeKey) return;
    setBattleType(typeKey);
    setShowStakeModal(true);
  }

  // После выбора ставки
  function handleStakeModalSelect(roomObj) {
    if (roomObj && typeof roomObj === "object" && roomObj.id) {
      setRoom(roomObj);
      setStep("room");
    } else {
      setRoom(null);
      setStep("menu");
    }
    setShowStakeModal(false);
    setBattleType(null);
  }

  // Если пользователь не определён, ничего не рендерим (или можно показать заглушку)
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
        <BattleRoom
          room={room}
          userId={user?.id}
          onExit={() => {
            setRoom(null);
            setStep("menu");
            setBattleType(null);
          }}
        />
      )}
    </>
  );
}