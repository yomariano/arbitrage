from setuptools import setup, find_packages

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name='arbitrage-api',
    version='0.0.1',
    description='A Python library which provides REST access https://github.com/Stakedllc/peregrine/',
    author='Fernando Callejon',
    author_email='fcallejon@gmail.com',
    long_description=long_description,
    long_description_content_type="text/markdown",
    license='MIT',
    url='https://github.com/fcallejon/arbitrage-api/',
    python_requires='>=3.7',
    install_requires=[
        "flask",
        "flask_restful",
        "numpy",
        "ccxt",
    ],
    packages=find_packages(),
    py_modules=['server'],
    include_package_data=True,
    entry_points={"console_scripts": ["arbitrage-api-server = server:main"]}
)
