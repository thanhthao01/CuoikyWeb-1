"use client";
import { useEffect, useState } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { useRouter } from "next/navigation";

interface Flashcard {
  vocabularyId: number;
  meaning: string;
  phonetic: string;
  exampleSentence: string;
  audio: string | undefined;
  imglink: string;
}

export default function FlashcardPage() {
  const [flipped, setFlipped] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>({});
  const [flashcard, setFlashCard] = useState<Flashcard>({
    vocabularyId: 0,
    meaning: "",
    phonetic: "",
    exampleSentence: "",
    audio: undefined,
    imglink: "",
  });
  //lấy thông tin người dùng
  useEffect(() => {
    async function fetchData() {
      try {
        const resUser = await fetch("http://localhost:4000/api/me", {
          credentials: "include",
        });
        const userData = await resUser.json();
        setUser(userData);
        if (!userData.loggedIn) {
          router.push("/");
        }
      } catch (error) {
        console.log("Lỗi khi lấy thông tin người dùng:", error);
        router.push("/");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.user?.userInfo?.userId) {
      fetchRandomFlashcard();
    }
  }, [user?.user?.userInfo?.userId]);

  const fetchRandomFlashcard = async () => {
    if (!user?.user?.userInfo?.userId) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/vocabulary/getRandomWord/${user.user.userInfo.userId}`
      );
      const result = await response.json();
      console.log("API Response:", result);
      if (result.status === "success" && result.data) {
        setCurrentWord(result.data.word);
        setFlashCard({
          vocabularyId: result.data.vocabularyId,
          meaning: result.data.meaning,
          phonetic: result.data.phonetic,
          exampleSentence: result.data.exampleSentence,
          audio: result.data.audio || undefined,
          imglink: result.data.imglink,
        });
      } else {
        setCurrentWord("");
        setFlashCard({
          vocabularyId: 0,
          meaning: "",
          phonetic: "",
          exampleSentence: "",
          audio: undefined,
          imglink: "",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy từ vựng:", error);
      setCurrentWord("");
      setFlashCard({
        vocabularyId: 0,
        meaning: "",
        phonetic: "",
        exampleSentence: "",
        audio: undefined,
        imglink: "",
      });
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="text-white p-10">Đang tải dữ liệu...</div>;
  }
  if (!isLoading && flashcard.vocabularyId == 0) {
    return (
      <div className="text-white p-10">Không có flashcard nào để hiển thị.</div>
    );
  }
  const handleSpeak = (text: string) => {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };
  const handleClick = () => {
    setFlipped(!flipped);
    handleSpeak(currentWord);
  };
  return (
    <>
      <Header />
      <div className="flex flex-col items-center gap-4 p-6 bg-white min-h-screen w-full">
        {/* Phần flashcard */}
        <div
          onClick={handleClick}
          className="w-[320px] h-[420px] relative cursor-pointer perspective"
        >
          <div
            className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            {/* Mặt trước */}
            <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-md p-4 flex flex-col items-center justify-center">
              {flashcard.imglink && (
                <img
                  src={flashcard.imglink}
                  alt="Ảnh minh họa"
                  className="h-40 w-full object-cover rounded mb-4"
                />
              )}
              <p className="text-gray-800 text-center">
                {flashcard.exampleSentence
                  ?.split(currentWord)
                  .map((part, index, arr) => (
                    <span key={index}>
                      {part}
                      {index < arr.length - 1 && <b>{currentWord}</b>}
                    </span>
                  )) || "Không có ví dụ"}
              </p>
            </div>

            {/* Mặt sau */}
            <div className="absolute w-full h-full rotate-y-180 backface-hidden bg-yellow-100 rounded-2xl shadow-md p-4 flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-yellow-900">
                {currentWord}
              </h2>
              <p className="italic text-yellow-800 mb-2">
                {flashcard.phonetic}
              </p>
              <p className="text-yellow-900 text-center mb-4">
                {flashcard.meaning}
              </p>
            </div>
          </div>
        </div>

        {/* Nút tiếp theo và đánh dấu */}
        <div className="flex gap-4 mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={(e) => {
              e.stopPropagation();
              fetchRandomFlashcard();
              setFlipped(false);
            }}
          >
            Tiếp tục
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
