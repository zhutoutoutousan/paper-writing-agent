import logging
from .gui.main_window import MainWindow

def main():
    """Main entry point for the paper agent application"""
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create and run the main window
    app = MainWindow()
    app.run()

if __name__ == "__main__":
    main() 