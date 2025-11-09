package config

import (
	"os"

	"github.com/ilyakaznacheev/cleanenv"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/wsngamerz/dataviewer/pkg/utils"
)

const (
	defaultPath = "development-config.yaml"
)

type Config struct {
	Service Service `yaml:"service"`
	Mongo   Mongo   `yaml:"mongo"`
}

type Service struct {
	LogLevel zerolog.Level `yaml:"logLevel"`
	Port     int64         `yaml:"port"`
}

type Mongo struct {
	ConnectionString           string `yaml:"connectionString"`
	DatabaseName               string `yaml:"databaseName"`
	FacebookImportsCollection  string `yaml:"facebookImportsCollection"`
	FacebookAccountsCollection string `yaml:"facebookAccountsCollection"`
	FacebookChatsCollection    string `yaml:"facebookChatsCollection"`
	FacebookMessagesCollection string `yaml:"facebookMessagesCollection"`
}

// GetConfig loads the variables from config.yaml
func GetConfig() (*Config, error) {
	var cfg Config
	err := cfg.ReadConfig()
	if err != nil {
		return nil, err
	}
	return &cfg, nil
}

// ReadConfig checks whether the production config file exists and loads it, otherwise it loads the development config file
func (c *Config) ReadConfig() error {
	configPath := os.Getenv("CONFIG_PATH")
	exists, err := utils.Exists(configPath)
	if err != nil {
		return err
	}
	if !exists {
		configPath = defaultPath
	}

	log.Info().Msgf("Loading config from %s", configPath)
	err = cleanenv.ReadConfig(configPath, c)
	if err != nil {
		return errors.Wrapf(err, "failed to read config from %s", configPath)
	}
	return nil
}

func (c *Config) Validate() error {
	return nil
}
