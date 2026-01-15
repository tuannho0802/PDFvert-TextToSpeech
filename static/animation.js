// static/animation.js
// Centralized animation system using GSAP (GreenSock Animation Platform)

// Ensure GSAP is loaded from CDN in index.html before this script

// Function to initialize page load animations
function initPageLoadAnimations() {
  gsap.from(".main-container", {
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out",
  });
  gsap.from(".header-section", {
    opacity: 0,
    y: -50,
    duration: 1,
    ease: "power3.out",
    delay: 0.5,
  });
}

// Function for button press effect
function applyButtonPressEffect(buttonElement) {
  if (!buttonElement) return;
  buttonElement.addEventListener(
    "mousedown",
    () => {
      gsap.to(buttonElement, {
        scale: 0.95,
        duration: 0.1,
        ease: "power1.out",
      });
    }
  );
  buttonElement.addEventListener(
    "mouseup",
    () => {
      gsap.to(buttonElement, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  );
  buttonElement.addEventListener(
    "mouseleave",
    () => {
      gsap.to(buttonElement, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  );
}

// Function for button hover glow effect (requires CSS for the glow)
function applyButtonHoverGlow(buttonElement) {
  if (!buttonElement) return;
  buttonElement.addEventListener(
    "mouseenter",
    () => {
      buttonElement.classList.add("hover-glow"); // Add CSS class for glow
    }
  );
  buttonElement.addEventListener(
    "mouseleave",
    () => {
      buttonElement.classList.remove(
        "hover-glow"
      );
    }
  );
}

// Function to animate the audio player appearance
function animateAudioPlayer(
  playerElement,
  show = true
) {
  if (!playerElement) return;
  if (show) {
    playerElement.classList.remove("hidden");
    gsap.fromTo(
      playerElement,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      }
    );
  } else {
    gsap.to(playerElement, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        playerElement.classList.add("hidden");
      },
    });
  }
}

// Function to animate the loading state (pulsing animation for a card)
let pulseAnimation;
function animateLoadingCard(
  cardElement,
  show = true
) {
  if (!cardElement) return;
  if (show) {
    cardElement.classList.add("relative"); // Needed for pseudo-elements or absolute positioning of loaders
    if (!pulseAnimation) {
      pulseAnimation = gsap.to(cardElement, {
        boxShadow:
          "0 0 0 5px rgba(34,197,94,0.3)", // Tailwind emerald-500 with opacity
        repeat: -1, // Infinite repeat
        yoyo: true, // Go back and forth
        duration: 1.5,
        ease: "power1.inOut",
      });
    } else {
      pulseAnimation.restart(true);
    }
  } else {
    if (pulseAnimation) {
      pulseAnimation.kill();
      pulseAnimation = null;
    }
    gsap.to(cardElement, {
      boxShadow:
        "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      duration: 0.3,
    }); // Reset shadow
    cardElement.classList.remove("relative");
  }
}

// Function to animate the global loader overlay
let globalLoaderAnimation;
function animateGlobalLoader(
  loaderElement,
  show = true
) {
  if (!loaderElement) return;

  if (show) {
    loaderElement.classList.remove("hidden");
    gsap.fromTo(
      loaderElement,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      }
    );
    const spinner = loaderElement.querySelector(
      ".animate-spin"
    );
    if (spinner) {
      globalLoaderAnimation = gsap.to(spinner, {
        scale: 1.1, // Slight pulse on the spinner itself
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: "power1.inOut",
      });
    }
  } else {
    if (globalLoaderAnimation) {
      globalLoaderAnimation.kill();
      globalLoaderAnimation = null;
    }
    gsap.to(loaderElement, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        loaderElement.classList.add("hidden");
      },
    });
  }
}

// Function to show animated toast notifications
function showToast(
  message,
  type = "success",
  duration = 3
) {
  const toastContainer =
    document.getElementById("toast-container");
  if (!toastContainer) {
    console.warn("Toast container not found!");
    alert(message); // Fallback to alert if container is missing
    return;
  }

  const toast = document.createElement("div");
  toast.className = `p-4 rounded-lg shadow-md flex items-center space-x-3 text-white transform translate-x-full transition-transform duration-300 ease-out`;

  let bgColorClass = "";
  let icon = "";

  if (type === "success") {
    bgColorClass = "bg-emerald-500";
    icon = "✅";
  } else if (type === "error") {
    bgColorClass = "bg-red-500";
    icon = "❌";
  } else if (type === "info") {
    bgColorClass = "bg-blue-500";
    icon = "ℹ️";
  }

  toast.innerHTML = `
    <span class="text-xl">${icon}</span>
    <span class="font-medium">${message}</span>
  `;
  toast.classList.add(bgColorClass);

  toastContainer.appendChild(toast);

  // Animate in
  gsap.to(toast, {
    x: 0,
    duration: 0.5,
    ease: "power2.out",
  });

  // Animate out after duration
  gsap.to(toast, {
    x: "100%",
    delay: duration,
    duration: 0.5,
    ease: "power2.in",
    onComplete: () => {
      toast.remove();
    },
  });
}

// Export functions for use in other scripts
window.animation = {
  initPageLoadAnimations,
  applyButtonPressEffect,
  applyButtonHoverGlow,
  animateAudioPlayer,
  animateLoadingCard,
  animateGlobalLoader,
  showToast,
};
