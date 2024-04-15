import { Box, Button, Flex, VStack } from "@chakra-ui/react";
import { useState, useRef, useCallback, useEffect } from "react";

const baseNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
const repetitions = 6;
const totalNumbers = baseNumbers.length * repetitions;
const loopNumbers = Array.from({ length: totalNumbers }, (_, i) => baseNumbers[i % baseNumbers.length]);
const startingPosition = 0;
const soundFile = '/sound.mp3';
const winSound = '/win.mp3';

const isPrime = (num) => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const SlotMachine = () => {
  const [spinning, setSpinning] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [prevHighlightedIndex, setPrevHighlightedIndex] = useState(null);
  const [finalNumber, setFinalNumber] = useState(null);
  const scrollRef = useRef(-8 * startingPosition);
  const flexRef = useRef(null);

  const updateHighlightedIndex = useCallback(() => {
    if (flexRef.current) {
      const node = flexRef.current;
      const containerRect = node.getBoundingClientRect();
      const winLine = window.innerWidth / 2;
      const nodeStart = node.children[0].getBoundingClientRect().left;
      const nodeWidth = node.children[0].getBoundingClientRect().width;
      const currentIndex = Math.floor((winLine - nodeStart) / nodeWidth) % totalNumbers;

      if (currentIndex !== prevHighlightedIndex) {
        const audio = new Audio(soundFile);
        audio.play();
        setPrevHighlightedIndex(currentIndex);
      }

      setHighlightedIndex(currentIndex - 1);
    }
  }, [prevHighlightedIndex, soundFile]);

  const startSpin = useCallback(() => {
    if (!spinning) {
      const randomStopNumber = Math.floor(Math.random() * baseNumbers.length) + 1;
      const offset = totalNumbers - baseNumbers.length;
      const finalPositionIndex = loopNumbers.lastIndexOf(randomStopNumber, offset);
      const adjustment = (Math.random() - 0.5) * 2;
      const visualAdjustment = adjustment * 8 * 0.5;
      const totalDistance = finalPositionIndex * 8 - 48 + visualAdjustment;
      scrollRef.current = -totalDistance;

      if (flexRef.current) {
        flexRef.current.style.transition = `transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)`;
        flexRef.current.style.transform = `translateX(${scrollRef.current}vw)`;
      }

      setTimeout(() => {
        if (flexRef.current) {
          flexRef.current.style.transition = 'transform 300ms ease-out';
          flexRef.current.style.transform = `translateX(${-finalPositionIndex * 8 + 48}vw)`;
        }
        setTimeout(() => {
          const finalNumber = loopNumbers[finalPositionIndex];
          setFinalNumber(finalNumber);
          if (finalNumber % 2 === 0 || isPrime(finalNumber)) {
            const winAudio = new Audio(winSound);
            winAudio.play();
          }
          setSpinning(false);
        }, 300);
      }, 5000);
    }
  }, [spinning, loopNumbers, isPrime, winSound]);

  const spin = useCallback(() => {
    if (!spinning) {
      setSpinning(true);
      scrollRef.current = -8 * startingPosition;
      if (flexRef.current) {
        flexRef.current.style.transition = 'none';
        flexRef.current.style.transform = `translateX(${scrollRef.current}vw)`;
      }
      setTimeout(startSpin, 10);
    }
  }, [spinning, startSpin]);

  useEffect(() => {
    const interval = setInterval(updateHighlightedIndex, 50);
    return () => clearInterval(interval);
  }, [updateHighlightedIndex]);

  return (
    <VStack spacing={4}>
      <Box position="relative" overflow="hidden" height="16vw" width="112vw">
        <Flex ref={flexRef} height="16vw" width={`${8 * totalNumbers}vw`} transition="none" transform={`translateX(${scrollRef.current}vw)`}>
          {loopNumbers.map((num, index) => (
            <Box key={index} width="8vw" height="16vw" border="1px solid" display="flex" alignItems="center" justifyContent="center" style={{ backgroundColor: highlightedIndex === index ? 'lightcoral' : 'transparent', fontWeight: highlightedIndex === index ? 'bold' : 'normal' }}>
              {num}
            </Box>
          ))}
        </Flex>
        <Box position="absolute" top="0" left="48vw" width="8vw" height="16vw" pointerEvents="none" borderLeft="2px solid red" borderRight="2px solid red" />
      </Box>
      <Button onClick={spin} disabled={spinning}>Spin</Button>
      {finalNumber !== null && (
        <div>Final number: {finalNumber}</div>
      )}
    </VStack>
  );
};

export default SlotMachine;