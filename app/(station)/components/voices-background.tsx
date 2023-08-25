export default function VoicesBackground() {
  const easeInOutSine = "0.37 0 0.63 1";
  const DURATION = 32;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 720 646"
        width="720"
        height="646"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path
            id="large-face"
            viewBox="0 0 523 828"
            d="m91 568 15 15 14 15-4 3-17 12-3 3c-2 1-2 3 0 4l4 3c6 3 12 8 17 13 12 12 19 26 19 43 0 9-1 19-4 28-5 17-15 30-30 40l-13 7-28 12-25 12c-7 4-13 8-18 13a68 68 0 0 0-18 35v2l2-1 11-10c6-5 12-10 19-13 9-5 19-7 29-7 9 0 17 2 25 6l6 2a79 79 0 0 0 94-25l20-26 7-9c9-13 22-23 38-29 15-6 30-9 47-9 13 1 25 4 36 10l28 14a84 84 0 0 0 74 2c30-12 53-32 68-60 8-15 14-31 17-48 2-10 2-20 2-31l-4-36c-3-18-8-35-16-50-14-30-36-51-65-67l-23-12c-6-3-12-6-17-11s-9-11-12-17c-6-12-4-23 4-33l8-8 9-8c7-6 11-13 12-22 1-6 0-12-2-17-3-9-7-16-14-22-4-5-10-8-16-10l-19-4a3351 3351 0 0 1-33-8c-13-7-17-20-15-31 1-7 4-13 7-20l4-10c1-7 0-14-3-20-4-8-10-14-19-18-7-3-15-6-24-7l-10-3c-14-4-24-13-30-26a1254 1254 0 0 1-10-51c-3-20-10-37-24-52a99 99 0 0 0-51-28c-15-4-30-4-46 0-17 4-31 13-40 28-3 4-6 8-7 13-8 17-12 34-12 53-1 23 3 45 11 67l26 68 17 47c4 12 7 24 9 37 4 33-2 65-19 95l-11 18c-6 10-12 21-16 33l-3 14-1 3c0 2 1 3 3 4h71c3 1 4 2 5 5l-1 3c-1 14-6 25-16 36l-21 22-17 18-1 1Zm72-148 4-3c10-5 20-8 31-10 4 0 7 0 10 2l4 2c9 4 26 5 34-2 3-3 8-3 12-2a469 469 0 0 1 32 9l2 2-3 3c-5 4-10 6-15 8a175 175 0 0 1-83 3l-24-9-4-3Z"
            fill="#EB94A5"
          >
            <animate
              attributeName="fill"
              values="#EB94A5; #ED675D; #5F5CF3; #ED675D; #EB94A5"
              repeatCount="indefinite"
              dur={DURATION}
            />
          </path>

          <path
            id="small-face"
            viewBox="0 0 613 465"
            d="M609 465c3-6 4-11 4-17 1-23-5-44-20-62-7-8-15-15-25-20-13-7-27-8-41-4l-20 7-26 8a86 86 0 0 1-63-14c-13-8-22-20-28-34l-5-16c-2-8 0-16 4-22 3-5 6-8 10-11l5-5-19-16 8-7 9-7-3-2-21-14c-1 0-3-1-2-2 7-3 15-3 23-5v-5c-4-19-12-36-27-48-13-12-28-18-44-22-13-3-25-4-38-5l-39-4c-14-3-26-11-36-21-7-8-13-16-18-26l-11-24-13-25a79 79 0 0 0-61-41c-9-2-18-1-27 1-17 3-30 13-42 26a88 88 0 0 0-22 72l2 16c1 15-2 29-8 42l-6 12c-4 6-7 13-8 21s-2 16 1 23c7 20 20 34 41 38 11 2 21 5 31 10l5 3c10 5 14 14 14 25l-1 9-2 8c-2 12 0 24 5 35 4 7 8 14 14 20 7 8 16 12 26 13l25 1c10-1 20-4 30-8 12-6 23-13 34-21 8-7 17-12 27-15 14-5 27-4 40 3 9 5 17 11 23 19l21 25c6 8 14 16 22 23 13 11 28 20 44 24a106 106 0 0 0 82-14l18-11 22-11c9-4 18-6 29-5 7 1 14 4 20 8 20 12 31 31 34 55l2 14 1 3ZM186 201l4-2 20-6c8-2 7-3 15 2 8 4 17 4 25 0l5-3c2-2 5-2 8-1l27 7 3 2-4 3-16 7c-20 6-40 7-60 4-6-1-12-2-18-5-3-2-7-4-9-8Z"
            fill="#ED675D"
          >
            <animate
              begin={0}
              attributeName="fill"
              values="#ED675D; #EB94A5; #ED675D; #5F5CF3; #ED675D"
              repeatCount="indefinite"
              dur={DURATION}
            />
          </path>

          <linearGradient
            id="background"
            gradientTransform="rotate(90 0.5 0.5)"
          >
            <stop offset="0" stopColor="#E29BA9">
              <animate
                attributeName="stop-color"
                values="#E29BA9; #E29BA9; #ED675D; #ED675D; #E29BA9"
                repeatCount="indefinite"
                dur={DURATION}
              />
            </stop>
            <stop offset="1" stopColor="#ED675D">
              <animate
                attributeName="stop-color"
                values="#ED675D; #ED675D; #632DFF; #632DFF; #ED675D"
                repeatCount="indefinite"
                dur={DURATION}
              />
            </stop>
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              values="90 0.5 0.5; 90 0.5 0.5; 180 0.5 0.5; 180 0.5 0.5; 90 0.5 0.5;"
              repeatCount="indefinite"
              dur={DURATION}
            />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url('#background')" />

        <use x="-107" y="-98" href="#small-face">
          <animate
            attributeName="x"
            values="-107; 279; -73; -107; -107"
            repeatCount="indefinite"
            dur={DURATION}
            calcMode="spline"
            keyTimes="0; 0.25; 0.5; 0.75; 1"
            keySplines={`${easeInOutSine}; ${easeInOutSine}; ${easeInOutSine}; ${easeInOutSine}`}
          />
          <animate
            attributeName="y"
            values="-98; 398; 282; -70; -98"
            repeatCount="indefinite"
            dur={DURATION}
            calcMode="spline"
            keyTimes="0; 0.25; 0.5; 0.75; 1"
            keySplines={`${easeInOutSine}; ${easeInOutSine}; ${easeInOutSine}; ${easeInOutSine}`}
          />
        </use>

        <use x="306" y="121" href="#large-face">
          <animate
            attributeName="x"
            values="306; 306; 396; 360; 306"
            repeatCount="indefinite"
            dur={DURATION}
            calcMode="spline"
            keyTimes="0; 0.25; 0.5; 0.75; 1"
            keySplines={`${easeInOutSine}; ${easeInOutSine}; ${easeInOutSine}; ${easeInOutSine}`}
          />
          <animate
            attributeName="y"
            values="121; -549; -259; 143; 121"
            repeatCount="indefinite"
            dur={DURATION}
            calcMode="spline"
            keyTimes="0; 0.25; 0.5; 0.75; 1"
            keySplines={`${easeInOutSine}; ${easeInOutSine}; ${easeInOutSine}; ${easeInOutSine}`}
          />
        </use>
      </svg>

      {/* Blur */}
      <div className="absolute inset-0 backdrop-blur-xl" />
    </div>
  );
}
