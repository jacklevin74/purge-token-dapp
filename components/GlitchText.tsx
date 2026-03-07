'use client';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className = '' }: GlitchTextProps) {
  return (
    <span
      className={`relative inline-block ${className}`}
      data-text={text}
    >
      {text}
      <style jsx>{`
        span::before,
        span::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        span::before {
          left: 2px;
          text-shadow: -1px 0 #00ffaa;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-1 5s infinite linear alternate-reverse;
          opacity: 0.6;
        }
        span::after {
          left: -2px;
          text-shadow: -1px 0 #ff2d2d, 1px 1px #ff2d2d;
          animation: glitch-2 4s infinite linear alternate-reverse;
          opacity: 0.6;
        }
        @keyframes glitch-1 {
          0% { clip: rect(132px, 350px, 101px, 30px); }
          5% { clip: rect(17px, 350px, 94px, 30px); }
          10% { clip: rect(40px, 350px, 66px, 30px); }
          15% { clip: rect(87px, 350px, 82px, 30px); }
          20% { clip: rect(137px, 350px, 61px, 30px); }
          25% { clip: rect(34px, 350px, 14px, 30px); }
          30% { clip: rect(133px, 350px, 74px, 30px); }
          35% { clip: rect(76px, 350px, 107px, 30px); }
          40% { clip: rect(59px, 350px, 130px, 30px); }
          45% { clip: rect(29px, 350px, 84px, 30px); }
          50% { clip: rect(22px, 350px, 67px, 30px); }
          55% { clip: rect(67px, 350px, 62px, 30px); }
          60% { clip: rect(10px, 350px, 105px, 30px); }
          65% { clip: rect(78px, 350px, 115px, 30px); }
          70% { clip: rect(105px, 350px, 13px, 30px); }
          75% { clip: rect(15px, 350px, 75px, 30px); }
          80% { clip: rect(66px, 350px, 39px, 30px); }
          85% { clip: rect(54px, 350px, 109px, 30px); }
          90% { clip: rect(21px, 350px, 148px, 30px); }
          95% { clip: rect(117px, 350px, 50px, 30px); }
          100% { clip: rect(4px, 350px, 91px, 30px); }
        }
        @keyframes glitch-2 {
          0% { clip: rect(129px, 350px, 36px, 30px); }
          5% { clip: rect(36px, 350px, 4px, 30px); }
          10% { clip: rect(85px, 350px, 66px, 30px); }
          15% { clip: rect(91px, 350px, 91px, 30px); }
          20% { clip: rect(148px, 350px, 138px, 30px); }
          25% { clip: rect(38px, 350px, 122px, 30px); }
          30% { clip: rect(69px, 350px, 54px, 30px); }
          35% { clip: rect(98px, 350px, 71px, 30px); }
          40% { clip: rect(146px, 350px, 34px, 30px); }
          45% { clip: rect(134px, 350px, 43px, 30px); }
          50% { clip: rect(102px, 350px, 80px, 30px); }
          55% { clip: rect(119px, 350px, 44px, 30px); }
          60% { clip: rect(106px, 350px, 99px, 30px); }
          65% { clip: rect(141px, 350px, 74px, 30px); }
          70% { clip: rect(20px, 350px, 78px, 30px); }
          75% { clip: rect(133px, 350px, 79px, 30px); }
          80% { clip: rect(78px, 350px, 52px, 30px); }
          85% { clip: rect(35px, 350px, 39px, 30px); }
          90% { clip: rect(67px, 350px, 70px, 30px); }
          95% { clip: rect(71px, 350px, 103px, 30px); }
          100% { clip: rect(83px, 350px, 40px, 30px); }
        }
      `}</style>
    </span>
  );
}
